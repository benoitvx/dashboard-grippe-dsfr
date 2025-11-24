"use client";

import useSWR from "swr";
// import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import { ApiResponse } from "@/types/grippe.types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface VaccinationKPIData {
  totalDoses: number;
  lastUpdateDate: string;
  previousCampaign: number;
  variation: number;
}

export function VaccinationKPI() {
  const { data, error, isLoading } = useSWR<ApiResponse<VaccinationKPIData>>(
    "/api/vaccination-kpi",
    fetcher,
    {
      refreshInterval: 86400000, // Refresh every 24 hours
      revalidateOnFocus: false,
    }
  );

  if (error) {
    return (
      <div className="fr-callout fr-callout--red-bourgeon">
        <p className="fr-callout__text">
          Erreur lors du chargement des données de vaccination
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="fr-card fr-p-4w" style={{ textAlign: "center" }}>
        <p>Chargement des données de vaccination...</p>
      </div>
    );
  }

  const vaccinationData = data?.data;

  if (!vaccinationData) {
    return (
      <div className="fr-callout">
        <p className="fr-callout__text">
          Aucune donnée de vaccination disponible
        </p>
      </div>
    );
  }

  const { totalDoses, lastUpdateDate, variation } = vaccinationData;

  // Format the date
  const formattedDate = new Date(lastUpdateDate).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Determine variation color and icon
  const variationColor = variation >= 0 ? "#18753C" : "#CE0500";
  const variationIcon = variation >= 0 ? "↗" : "↘";
  const variationText =
    variation >= 0 ? `+${variation.toFixed(1)}%` : `${variation.toFixed(1)}%`;

  return (
    <section className="fr-py-6w">
      <h2 className="fr-h2 fr-mb-3w">Combien de personnes vaccinées ?</h2>
      <details className="fr-accordion">
        <summary className="fr-accordion__title">
          <button
            className="fr-accordion__btn"
            aria-expanded="false"
            aria-controls="accordion-content-5"
          >
            Que signifie ce chiffre ?
          </button>
        </summary>
        <div className="fr-collapse" id="accordion-content-5">
          <p>
            Ce chiffre indique le nombre total de doses de vaccin contre la grippe délivrées depuis le début de la campagne. Il reflète l'adhésion de la population à la vaccination.
          </p>
        </div>
      </details>
      <div className="fr-card fr-card--no-border fr-card--shadow" style={{ marginTop: "1rem" }}>
        <div className="fr-card__body">
          <div className="fr-card__content">
            <p className="fr-text--sm fr-mb-4w">
              Nombre total de doses de vaccin grippe délivrées
            </p>

            {/* KPI principal */}
            <div
              className="fr-card fr-card--sm"
              style={{
                backgroundColor: "#E3E3FD",
                border: "2px solid #000091",
              }}
            >
              <div className="fr-card__body">
                <div className="fr-card__content" style={{ textAlign: "center" }}>
                  <p
                    className="fr-text--sm"
                    style={{ marginBottom: "0.5rem", color: "#666" }}
                  >
                    Total doses délivrées
                  </p>
                  <p
                    style={{
                      fontSize: "3rem",
                      fontWeight: "bold",
                      color: "#000091",
                      margin: "0.5rem 0",
                    }}
                  >
                    {totalDoses.toLocaleString("fr-FR")}
                  </p>

                  {/* Badge variation */}
                  {variation !== 0 && (
                    <div style={{ marginTop: "1rem" }}>
                      <span
                        className="fr-badge"
                        style={{
                          backgroundColor: variationColor,
                          color: "white",
                          padding: "0.5rem 1rem",
                          fontSize: "1rem",
                          fontWeight: "bold",
                        }}
                      >
                        {variationIcon} {variationText} vs campagne précédente
                      </span>
                    </div>
                  )}

                  <p
                    className="fr-text--xs fr-mt-2w"
                    style={{ color: "#666" }}
                  >
                    Mise à jour : {formattedDate}
                  </p>
                </div>
              </div>
            </div>

            <p className="fr-text--xs fr-mt-4w" style={{ color: "#666" }}>
              Source : <a href="https://www.data.gouv.fr/fr/organizations/iqvia-france/" target="_blank" rel="noopener noreferrer">IQVIA</a> - Campagne 2025-2026 • Données hebdomadaires des
              pharmacies
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
