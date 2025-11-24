"use client";

import useSWR from "swr";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
// import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import { ApiResponse, SentiwebData } from "@/types/grippe.types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function HeroIncidence() {
  const { data, error, isLoading } = useSWR<ApiResponse<SentiwebData>>(
    "/api/incidence-nationale",
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
          Erreur lors du chargement des données d&apos;incidence
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="fr-card fr-p-4w" style={{ textAlign: "center" }}>
        <p>Chargement des données...</p>
      </div>
    );
  }

  const incidence = data?.data.incidence || 0;
  const variation = data?.data.variation || 0;
  const semaine = data?.data.semaine || "N/A";

  const variationBadge =
    variation > 0 ? (
      <Badge severity="error" noIcon>
        +{variation.toFixed(1)}% vs S-1
      </Badge>
    ) : variation < 0 ? (
      <Badge severity="success" noIcon>
        {variation.toFixed(1)}% vs S-1
      </Badge>
    ) : (
      <Badge severity="info" noIcon>
        Stable vs S-1
      </Badge>
    );

  return (
    <section className="fr-py-6w">
      <h2 className="fr-h2 fr-mb-3w">Où en est l'épidémie aujourd'hui ?</h2>
      <details style={{ marginBottom: '1rem', border: '1px solid #ddd', padding: '1rem', borderRadius: '4px' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem', color: '#000091' }}>
          Qu'est-ce que le taux d'incidence ?
        </summary>
        <div style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
          <p>
            Cet indicateur mesure le nombre de nouveaux cas de grippe pour 100 000 habitants en France. Il permet de savoir si l'épidémie progresse, stagne ou diminue. Les données sont mises à jour chaque semaine.
          </p>
        </div>
      </details>
      <div className="fr-card fr-card--no-border fr-card--shadow" style={{ marginTop: "1rem" }}>
        <div className="fr-card__body">
          <div className="fr-card__content">
            <p className="fr-text--sm fr-mb-2w">Semaine {semaine}</p>
            <div
              style={{
                fontSize: "3rem",
                fontWeight: "bold",
                color: "var(--text-title-blue-france)",
                marginBottom: "1rem",
              }}
            >
              {incidence.toLocaleString("fr-FR")}
            </div>
            <p className="fr-text--sm fr-mb-2w">
              cas pour 100 000 habitants
            </p>
            <div>{variationBadge}</div>
            <p className="fr-text--xs fr-mt-4w" style={{ color: "#666" }}>
              Source : <a href="https://www.sentiweb.fr" target="_blank" rel="noopener noreferrer">Sentiweb</a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
