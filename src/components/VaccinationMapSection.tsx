'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
// import { Accordion } from '@codegouvfr/react-dsfr/Accordion';

// Import dynamically to avoid SSR issues with Leaflet
const VaccinationMap = dynamic(() => import('./VaccinationMap'), {
  ssr: false,
  loading: () => (
    <div className="fr-p-4w" style={{ textAlign: 'center', minHeight: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      Chargement de la carte...
    </div>
  ),
});

interface Suggestion {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    house_number?: string;
    road?: string;
    postcode?: string;
    city?: string;
    town?: string;
    village?: string;
  };
  name?: string;
}

export default function VaccinationMapSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState<[number, number] | undefined>();
  const [userLocation, setUserLocation] = useState<[number, number] | undefined>();
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setError(null);

    try {
      console.log('🔍 Recherche géocodage pour:', searchQuery);

      // Use Nominatim API for geocoding (OpenStreetMap)
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=fr&limit=1`;
      console.log('📍 URL Nominatim:', url);

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Dashboard-Grippe-DSFR/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Réponse Nominatim:', data);

      if (data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const coords: [number, number] = [parseFloat(lat), parseFloat(lon)];
        console.log('📍 Coordonnées trouvées:', coords, display_name);
        setSearchLocation(coords);
        setUserLocation(undefined); // Clear user location when searching
      } else {
        console.warn('⚠️ Aucun résultat pour:', searchQuery);
        setError('Adresse non trouvée. Veuillez réessayer.');
      }
    } catch (err) {
      console.error('❌ Geocoding error:', err);
      setError('Erreur lors de la recherche. Veuillez réessayer.');
    } finally {
      setSearching(false);
    }
  }

  function formatSuggestion(suggestion: Suggestion): string {
    const addr = suggestion.address;

    if (!addr) {
      return suggestion.display_name.split(',').slice(0, 2).join(',');
    }

    const city = addr.city || addr.town || addr.village || '';
    const postcode = addr.postcode || '';

    // Si on a un numéro de rue
    if (addr.house_number && addr.road) {
      return `${addr.house_number} ${addr.road}, ${postcode} ${city}`.trim();
    }

    // Si on a juste une rue
    if (addr.road) {
      return `${addr.road}, ${postcode} ${city}`.trim();
    }

    // Sinon on utilise le nom du lieu
    if (suggestion.name) {
      return `${suggestion.name}, ${postcode} ${city}`.trim();
    }

    // Fallback : prendre les 2 premiers éléments du display_name
    return suggestion.display_name.split(',').slice(0, 2).join(',').trim();
  }

  async function fetchSuggestions(query: string) {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      // Ajout de addressdetails=1 pour obtenir les détails d'adresse
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=fr&limit=5&addressdetails=1`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Dashboard-Grippe-DSFR/1.0'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des suggestions:', err);
    }
  }

  function handleInputChange(value: string) {
    setSearchQuery(value);

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer for debounce (200ms)
    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 200);
  }

  function handleSuggestionClick(suggestion: Suggestion) {
    const coords: [number, number] = [parseFloat(suggestion.lat), parseFloat(suggestion.lon)];
    setSearchLocation(coords);
    setUserLocation(undefined);
    setSearchQuery(formatSuggestion(suggestion));
    setShowSuggestions(false);
    setSuggestions([]);
  }

  function handleGeolocate() {
    if (!navigator.geolocation) {
      setError('La géolocalisation n\'est pas supportée par votre navigateur.');
      return;
    }

    setLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
        setSearchLocation(undefined); // Clear search location when geolocating
        setLocating(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError('Impossible de récupérer votre position. Vérifiez les autorisations.');
        setLocating(false);
      }
    );
  }

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return (
    <section className="fr-py-6w">
      <h2 className="fr-h2 fr-mb-3w">Où puis-je me faire vacciner ?</h2>
      <details style={{ marginBottom: '1rem', border: '1px solid #ddd', padding: '1rem', borderRadius: '4px' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem', color: '#000091' }}>
          Comment utiliser cette carte ?
        </summary>
        <div style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
          <p>
            Cette carte vous permet de trouver les pharmacies et centres de vaccination près de chez vous. Utilisez la recherche par adresse ou la géolocalisation pour identifier les lieux les plus proches.
          </p>
        </div>
      </details>
      <div className="fr-card fr-card--no-border fr-card--shadow" style={{ marginTop: "1rem" }}>
        <div className="fr-card__body">
          <div className="fr-card__content">
            <p className="fr-card__desc">
              Trouvez les pharmacies proposant la vaccination contre la grippe près de chez vous.
            </p>

          <div className="fr-grid-row fr-grid-row--gutters fr-mb-3w">
            <div className="fr-col-12 fr-col-md-8" style={{ position: 'relative' }}>
              <form onSubmit={handleSearch}>
                <div className="fr-search-bar" role="search">
                  <input
                    className="fr-input"
                    placeholder="Rechercher une adresse (ville, code postal...)"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => handleInputChange(e.target.value)}
                    disabled={searching}
                    autoComplete="off"
                  />
                  <button
                    className="fr-btn"
                    type="submit"
                    title="Rechercher"
                    disabled={searching || !searchQuery.trim()}
                  >
                    {searching ? 'Recherche...' : 'Rechercher'}
                  </button>
                </div>
              </form>

              {showSuggestions && suggestions.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderTop: 'none',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    zIndex: 1000,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                >
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        borderBottom: index < suggestions.length - 1 ? '1px solid #f0f0f0' : 'none',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f6f6f6'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      <div style={{ fontSize: '14px', color: '#333' }}>
                        {formatSuggestion(suggestion)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="fr-col-12 fr-col-md-4">
              <button
                className="fr-btn fr-btn--secondary fr-btn--icon-left fr-icon-map-pin-2-line"
                onClick={handleGeolocate}
                disabled={locating}
                style={{ width: '100%' }}
              >
                {locating ? 'Localisation...' : 'Me localiser'}
              </button>
            </div>
          </div>

          {error && (
            <div className="fr-alert fr-alert--error fr-alert--sm fr-mb-2w">
              <p>{error}</p>
            </div>
          )}

          <VaccinationMap
            searchLocation={searchLocation}
            userLocation={userLocation}
          />

          <div className="fr-mt-2w">
            <p className="fr-text--xs" style={{ color: '#666' }}>
              <strong>Note :</strong> Les données sont mises à jour quotidiennement et proviennent des déclarations volontaires des pharmacies.
              Tous les marqueurs sont affichés sur la carte (cliquez sur un marqueur pour voir les détails).
            </p>
            <p className="fr-text--xs fr-mt-2w" style={{ color: '#666' }}>
              Source : <a href="https://www.data.gouv.fr" target="_blank" rel="noopener noreferrer">data.gouv.fr</a> - Lieux de vaccination contre la grippe
            </p>
          </div>
        </div>
      </div>
    </div>
    </section>
  );
}
