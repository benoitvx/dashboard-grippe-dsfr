'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { VaccinationLocation } from '@/types/vaccination';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapUpdaterProps {
  center: [number, number];
  zoom: number;
}

function MapUpdater({ center, zoom }: MapUpdaterProps) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);

  return null;
}

interface VaccinationMapProps {
  searchLocation?: [number, number];
  userLocation?: [number, number];
}

export default function VaccinationMap({
  searchLocation,
  userLocation,
}: VaccinationMapProps) {
  const [locations, setLocations] = useState<VaccinationLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([46.603354, 1.888334]); // Centre de la France
  const [mapZoom, setMapZoom] = useState(6);

  useEffect(() => {
    async function fetchLocations() {
      try {
        setLoading(true);
        // Augmentation de la limite à 20000 pharmacies (sans clustering)
        const response = await fetch('/api/vaccination-locations?limit=20000');
        const data = await response.json();
        console.log('📍 Nombre de pharmacies chargées:', data.locations?.length || 0);
        setLocations(data.locations || []);
      } catch (error) {
        console.error('Error loading vaccination locations:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLocations();
  }, []);

  useEffect(() => {
    if (searchLocation) {
      console.log('🗺️ Zoom sur recherche:', searchLocation);
      setMapCenter(searchLocation);
      setMapZoom(13);
    } else if (userLocation) {
      console.log('🗺️ Zoom sur position utilisateur:', userLocation);
      setMapCenter(userLocation);
      setMapZoom(13);
    }
  }, [searchLocation, userLocation]);

  function extractHours(html: string): string {
    const match = html.match(/<div class="horaires">([\s\S]*?)<\/div>/);
    if (match) {
      return match[1]
        .replace(/<li>/g, '')
        .replace(/<\/li>/g, '\n')
        .trim();
    }
    return 'Horaires non disponibles';
  }

  function extractAccess(html: string): string {
    const match = html.match(/<strong>Accès :<\/strong>\s*([^<]+)/);
    return match ? match[1].trim() : 'Non spécifié';
  }

  if (loading) {
    return (
      <div className="fr-p-4w" style={{ textAlign: 'center' }}>
        Chargement de la carte...
      </div>
    );
  }

  return (
    <div style={{ height: '600px', width: '100%', position: 'relative' }}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        scrollWheelZoom={true}
      >
        <MapUpdater center={mapCenter} zoom={mapZoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {locations.map((location, index) => (
          <Marker
            key={`${location.finess}-${location.latitude}-${location.longitude}-${index}`}
            position={[location.latitude, location.longitude]}
          >
            <Popup maxWidth={300}>
              <div style={{ minWidth: '250px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '8px', color: '#000091' }}>
                  {location.titre}
                </h3>
                <p style={{ fontSize: '14px', marginBottom: '4px' }}>
                  <strong>Adresse :</strong><br />
                  {location.adresse_voie1}
                  {location.adresse_voie2 && <><br />{location.adresse_voie2}</>}
                  <br />
                  {location.adresse_codepostal} {location.adresse_ville}
                </p>
                <p style={{ fontSize: '14px', marginBottom: '4px' }}>
                  <strong>Accès :</strong> {extractAccess(location.modalites_accueil)}
                </p>
                <div style={{ fontSize: '12px', whiteSpace: 'pre-line', marginTop: '8px' }}>
                  <strong>Horaires :</strong><br />
                  {extractHours(location.modalites_accueil)}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {searchLocation && (
          <Marker
            position={searchLocation}
            icon={L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
              shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            })}
          >
            <Popup>
              <div>
                <strong>Votre recherche</strong>
              </div>
            </Popup>
          </Marker>
        )}

        {userLocation && (
          <Marker
            position={userLocation}
            icon={L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
              shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            })}
          >
            <Popup>
              <div>
                <strong>Votre position</strong>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
