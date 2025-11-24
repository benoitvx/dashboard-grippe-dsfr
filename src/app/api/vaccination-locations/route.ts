import { NextResponse } from 'next/server';
import type { VaccinationLocation } from '@/types/vaccination';

const CSV_URL = 'https://static.data.gouv.fr/resources/lieux-de-vaccination-contre-la-grippe-pharmacies-sante-fr/20251123-220138/santefr-lieux-vaccination-grippe-pharmacie.csv';

export const dynamic = 'force-dynamic';

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ';' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseFrenchNumber(value: string): number {
  return parseFloat(value.replace(',', '.'));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const bbox = searchParams.get('bbox'); // Format: "minLat,minLon,maxLat,maxLon"

    const response = await fetch(CSV_URL);
    const csvText = await response.text();
    const lines = csvText.split('\n');

    console.log('📊 Total de lignes dans le CSV:', lines.length);

    const locations: VaccinationLocation[] = [];

    // Parse CSV (skip header)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const fields = parseCSVLine(line);

      if (fields.length < 9) continue;

      const latitude = parseFrenchNumber(fields[7]);
      const longitude = parseFrenchNumber(fields[8]);

      // Skip invalid coordinates
      if (isNaN(latitude) || isNaN(longitude)) continue;

      // Apply bounding box filter if provided
      if (bbox) {
        const [minLat, minLon, maxLat, maxLon] = bbox.split(',').map(Number);
        if (
          latitude < minLat || latitude > maxLat ||
          longitude < minLon || longitude > maxLon
        ) {
          continue;
        }
      }

      locations.push({
        finess: fields[0],
        titre: fields[1],
        adresse_voie1: fields[2],
        adresse_voie2: fields[3] || undefined,
        adresse_codepostal: fields[4],
        adresse_ville: fields[5],
        modalites_accueil: fields[6],
        latitude,
        longitude,
      });

      // Apply limit if specified
      if (limit && locations.length >= parseInt(limit)) {
        break;
      }
    }

    console.log('✅ Pharmacies chargées avec succès:', locations.length);
    console.log('📍 Exemple première pharmacie:', locations[0]);

    return NextResponse.json({
      total: locations.length,
      locations,
    });
  } catch (error) {
    console.error('Error fetching vaccination locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vaccination locations' },
      { status: 500 }
    );
  }
}
