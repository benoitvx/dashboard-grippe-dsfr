import { ApiResponse } from "@/types/grippe.types";

const ODISSE_API_BASE_URL =
  "https://odisse.santepubliquefrance.fr/api/explore/v2.1/catalog/datasets/grippe-passages-aux-urgences-et-actes-sos-medecins-france/records";

const ODISSE_API_PARAMS = new URLSearchParams({
  refine: "sursaud_cl_age_gene:Tous âges",
  order_by: "date_complet DESC",
});

interface OdisseRecord {
  date_complet: string; // Format YYYY-MM-DD
  semaine: string; // Format YYYY-SWW
  sursaud_cl_age_gene: string; // Catégorie d'âge
  taux_passages_grippe_sau: number; // Taux de passages aux urgences pour 100k hab
  taux_hospit_grippe_sau: number; // Taux d'hospitalisations pour 100k hab
  taux_actes_grippe_sos: number; // Taux d'actes SOS Médecins pour 100k hab
}

async function fetchAllRecords(): Promise<OdisseRecord[]> {
  const allRecords: OdisseRecord[] = [];
  let offset = 0;
  const limit = 100;
  let totalCount = 0;

  console.log("🔍 Fetching ODISSE data with pagination...");

  do {
    const url = `${ODISSE_API_BASE_URL}?${ODISSE_API_PARAMS}&limit=${limit}&offset=${offset}`;

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiResponse = await response.json();
    const records: OdisseRecord[] = apiResponse.results || [];

    if (offset === 0) {
      totalCount = apiResponse.total_count || 0;
      console.log(`📊 Total records available: ${totalCount}`);
    }

    console.log(`📥 Fetched ${records.length} records at offset ${offset}`);
    allRecords.push(...records);

    offset += limit;

    // Continue until we've fetched all records or no more records returned
    if (records.length < limit) break;

  } while (offset < 400); // Fetch up to 400 records (covers all seasons we need)

  console.log(`✅ Total records fetched: ${allRecords.length}`);
  return allRecords;
}

export async function fetchHospitalisations(): Promise<
  ApiResponse<{
    latest: number;
    latestDate: string;
    evolutionBySeason: Record<string, (number | null)[]>;
  }>
> {
  try {
    const records = await fetchAllRecords();

    if (!Array.isArray(records) || records.length === 0) {
      throw new Error("Invalid API response format or no data");
    }

    // Trier par date décroissante (plus récent en premier)
    const sortedRecords = records.sort(
      (a, b) =>
        new Date(b.date_complet).getTime() -
        new Date(a.date_complet).getTime()
    );

    // Dernière valeur pour le KPI
    const latest = sortedRecords[0];
    const latestValue = Math.round(latest.taux_hospit_grippe_sau || 0);
    const latestDate = latest.date_complet;

    // Indexer les données par semaine (format YYYY-SWW)
    const dataByWeek = new Map<string, number>();
    records.forEach((record) => {
      dataByWeek.set(
        record.semaine,
        Math.round(record.taux_hospit_grippe_sau || 0)
      );
    });

    console.log("📊 Total records fetched:", records.length);
    console.log("🗂️ ODISSE dataByWeek size:", dataByWeek.size);
    console.log("🗂️ ODISSE sample weeks:", Array.from(dataByWeek.keys()).slice(0, 10));

    // Définir les saisons (Oct-Mars)
    // On exclut 2020-2021 et 2021-2022 (années COVID avec données plates)
    const seasons = ["2022-2023", "2023-2024", "2024-2025", "2025-2026"];

    const evolutionBySeason: Record<string, (number | null)[]> = {};

    seasons.forEach((season) => {
      const [startYear, endYear] = season.split("-").map((y) => parseInt(y));
      const seasonData: (number | null)[] = [];

      // Semaines 40-52 de l'année de début
      for (let week = 40; week <= 52; week++) {
        const weekKey = `${startYear}-S${week.toString().padStart(2, "0")}`;
        const value = dataByWeek.get(weekKey);
        seasonData.push(value !== undefined ? value : null);
      }

      // Semaines 1-13 de l'année de fin
      for (let week = 1; week <= 13; week++) {
        const weekKey = `${endYear}-S${week.toString().padStart(2, "0")}`;
        const value = dataByWeek.get(weekKey);
        seasonData.push(value !== undefined ? value : null);
      }

      evolutionBySeason[season] = seasonData;
    });

    console.log("🎯 Saisons détectées:", Object.keys(evolutionBySeason));
    console.log(
      "📈 Nombre de valeurs non-null par saison:",
      Object.entries(evolutionBySeason).map(([s, data]) => [
        s,
        data.filter((v) => v !== null).length,
      ])
    );

    console.log(
      `✅ Fetched ${records.length} hospitalisations records. Latest: ${latestValue} (${latestDate})`
    );

    return {
      data: {
        latest: latestValue,
        latestDate,
        evolutionBySeason,
      },
    };
  } catch (error) {
    console.error("Error fetching hospitalisations:", error);
    return {
      data: {
        latest: 0,
        latestDate: "N/A",
        evolutionBySeason: {},
      },
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
