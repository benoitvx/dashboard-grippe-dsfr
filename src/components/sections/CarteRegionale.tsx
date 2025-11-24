"use client";

import useSWR from "swr";
// import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import { ApiResponse, RegionData } from "@/types/grippe.types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Fonction pour obtenir la couleur selon le niveau d'incidence
function getIncidenceColor(incidence: number): string {
  if (incidence >= 100) return "#CE0500"; // Rouge foncé - Très élevé
  if (incidence >= 75) return "#FF5655"; // Rouge - Élevé
  if (incidence >= 50) return "#FF9575"; // Orange - Moyen-élevé
  if (incidence >= 25) return "#FFE9AA"; // Jaune - Moyen
  return "#E3E3FD"; // Bleu clair - Faible
}

// Fonction pour obtenir le label du niveau
function getIncidenceLevel(incidence: number): string {
  if (incidence >= 100) return "Très élevé";
  if (incidence >= 75) return "Élevé";
  if (incidence >= 50) return "Moyen-élevé";
  if (incidence >= 25) return "Moyen";
  return "Faible";
}

export function CarteRegionale() {

  const { data, error, isLoading } = useSWR<ApiResponse<RegionData[]>>(
    "/api/incidence-regions",
    fetcher,
    {
      refreshInterval: 3600000, // Refresh every hour
      revalidateOnFocus: false,
    }
  );

  if (error) {
    return (
      <div className="fr-callout fr-callout--red-bourgeon">
        <p className="fr-callout__text">
          Erreur lors du chargement des données régionales
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="fr-card fr-p-4w" style={{ textAlign: "center" }}>
        <p>Chargement de la carte...</p>
      </div>
    );
  }

  const regions = data?.data || [];

  // Trier par incidence décroissante
  const sortedRegions = [...regions].sort((a, b) => b.incidence - a.incidence);

  return (
    <section className="fr-py-6w">
      <h2 className="fr-h2 fr-mb-3w">Quelle est la situation dans ma région ?</h2>
      <details style={{ marginBottom: '1rem', border: '1px solid #ddd', padding: '1rem', borderRadius: '4px' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem', color: '#000091' }}>
          Comment lire cette carte ?
        </summary>
        <div style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
          <p>
            Cette carte montre l'intensité de l'épidémie dans chaque région française. Plus la couleur est foncée, plus le taux d'incidence est élevé. Comparez votre région aux autres pour situer la dynamique locale.
          </p>
        </div>
      </details>
      <div className="fr-card fr-card--no-border fr-card--shadow" style={{ marginTop: "1rem" }}>
        <div className="fr-card__body">
          <div className="fr-card__content">
            <p className="fr-text--sm fr-mb-4w">
              Taux d&apos;incidence pour 100 000 habitants (dernière semaine disponible)
            </p>

            {/* Légende */}
            <div className="fr-mb-4w fr-p-3w" style={{
              backgroundColor: "#f6f6f6",
              borderRadius: "8px"
            }}>
              <p className="fr-text--sm fr-mb-2w" style={{ fontWeight: "bold" }}>
                Légende :
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                {[
                  { label: "Faible (< 25)", color: "#E3E3FD" },
                  { label: "Moyen (25-49)", color: "#FFE9AA" },
                  { label: "Moyen-élevé (50-74)", color: "#FF9575" },
                  { label: "Élevé (75-99)", color: "#FF5655" },
                  { label: "Très élevé (≥ 100)", color: "#CE0500" }
                ].map(({ label, color }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{
                      width: "20px",
                      height: "20px",
                      backgroundColor: color,
                      border: "1px solid #ddd",
                      borderRadius: "4px"
                    }}></div>
                    <span className="fr-text--xs">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Grille de cartes régionales */}
            <div className="fr-grid-row fr-grid-row--gutters">
              {sortedRegions.map((region) => {
                const bgColor = getIncidenceColor(region.incidence);
                const level = getIncidenceLevel(region.incidence);
                const textColor = region.incidence >= 75 ? "#fff" : "#161616";

                return (
                  <div key={region.code} className="fr-col-12 fr-col-sm-6 fr-col-md-4 fr-col-lg-3">
                    <div
                      className="fr-card fr-card--sm"
                      style={{
                        backgroundColor: bgColor,
                        border: `2px solid ${region.incidence >= 100 ? "#8B0000" : "#ddd"}`,
                        transition: "transform 0.2s, box-shadow 0.2s",
                        cursor: "default"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <div className="fr-card__body">
                        <div className="fr-card__content">
                          <h3 className="fr-card__title" style={{
                            color: textColor,
                            fontSize: "1rem",
                            marginBottom: "0.5rem"
                          }}>
                            {region.nom}
                          </h3>
                          <p style={{
                            color: textColor,
                            fontSize: "1.75rem",
                            fontWeight: "bold",
                            margin: "0.5rem 0"
                          }}>
                            {region.incidence}
                          </p>
                          <p className="fr-text--xs" style={{
                            color: textColor,
                            opacity: 0.9,
                            marginBottom: "0.25rem"
                          }}>
                            cas / 100k hab.
                          </p>
                          <p className="fr-badge fr-badge--sm" style={{
                            backgroundColor: region.incidence >= 75 ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
                            color: textColor,
                            display: "inline-block",
                            marginTop: "0.5rem"
                          }}>
                            {level}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="fr-text--xs fr-mt-4w" style={{ color: "#666" }}>
              Source : <a href="https://www.sentiweb.fr" target="_blank" rel="noopener noreferrer">Réseau Sentiweb</a> • Données de la dernière semaine disponible
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
