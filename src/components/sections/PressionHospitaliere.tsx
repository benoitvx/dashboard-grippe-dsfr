"use client";

import useSWR from "swr";
// import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import { ApiResponse } from "@/types/grippe.types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Couleurs DSFR pour les saisons (codes hex)
const SEASON_COLORS: Record<string, string> = {
  "2022-2023": "#000091", // Bleu France
  "2023-2024": "#009081", // Vert Archipel
  "2024-2025": "#CE614A", // Orange Terre Battue
  "2025-2026": "#E1000F", // Rouge Marianne
};

interface HospitalisationsData {
  latest: number;
  latestDate: string;
  evolutionBySeason: Record<string, (number | null)[]>;
}

export function PressionHospitaliere() {
  const { data, error, isLoading } = useSWR<
    ApiResponse<HospitalisationsData>
  >("/api/hospitalisations", fetcher, {
    refreshInterval: 3600000, // Refresh every hour
    revalidateOnFocus: false,
  });

  if (error) {
    return (
      <div className="fr-callout fr-callout--red-bourgeon">
        <p className="fr-callout__text">
          Erreur lors du chargement des données d&apos;hospitalisation
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="fr-card fr-p-4w" style={{ textAlign: "center" }}>
        <p>Chargement des données d&apos;hospitalisation...</p>
      </div>
    );
  }

  const hospitalisationsData = data?.data;

  if (!hospitalisationsData) {
    return (
      <div className="fr-callout">
        <p className="fr-callout__text">
          Aucune donnée d&apos;hospitalisation disponible
        </p>
      </div>
    );
  }

  const { latest, latestDate, evolutionBySeason } = hospitalisationsData;
  const seasons = Object.keys(evolutionBySeason).sort();

  // Transformer les données pour Recharts
  const maxLength = Math.max(
    ...Object.values(evolutionBySeason).map((arr) => arr.length)
  );

  const chartData = [];
  for (let i = 0; i < maxLength; i++) {
    const dataPoint: Record<string, number | string> = {
      week: i,
      weekLabel: i < 13 ? `S${40 + i}` : `S${i - 13 + 1}`,
    };

    seasons.forEach((season) => {
      const seasonData = evolutionBySeason[season];
      const value = seasonData[i];

      // Ne pas ajouter la propriété si la valeur est 0 ou undefined
      if (value && value > 0) {
        dataPoint[season] = value;
      }
    });

    chartData.push(dataPoint);
  }

  return (
    <section className="fr-py-6w">
      <h2 className="fr-h2 fr-mb-3w">Quel impact sur les hôpitaux ?</h2>
      <details style={{ marginBottom: '1rem', border: '1px solid #ddd', padding: '1rem', borderRadius: '4px' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem', color: '#000091' }}>
          Pourquoi suivre les hospitalisations ?
        </summary>
        <div style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
          <p>
            Ce graphique suit le nombre d'hospitalisations après passage aux urgences pour syndrome grippal. C'est un indicateur de la gravité de l'épidémie et de la pression sur le système de santé.
          </p>
        </div>
      </details>
      <div className="fr-card fr-card--no-border fr-card--shadow" style={{ marginTop: "1rem" }}>
        <div className="fr-card__body">
          <div className="fr-card__content">
            <p className="fr-text--sm fr-mb-4w">
              Nombre d&apos;hospitalisations après passage aux urgences pour
              syndrome grippal
            </p>

            {/* KPI dernière valeur */}
            <div className="fr-mb-4w">
              <div
                className="fr-card fr-card--sm"
                style={{
                  backgroundColor: "#FEF4E6",
                  border: "2px solid #FF9575",
                }}
              >
                <div className="fr-card__body">
                  <div className="fr-card__content" style={{ textAlign: "center" }}>
                    <p className="fr-text--sm" style={{ marginBottom: "0.5rem", color: "#666" }}>
                      Dernière donnée ({latestDate})
                    </p>
                    <p
                      style={{
                        fontSize: "2.5rem",
                        fontWeight: "bold",
                        color: "#CE614A",
                        margin: "0.5rem 0",
                      }}
                    >
                      {latest.toLocaleString()}
                    </p>
                    <p className="fr-text--xs" style={{ color: "#666" }}>
                      hospitalisations
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Graphique Recharts */}
            <div className="fr-mt-4w" style={{ width: "100%", height: 400 }}>
              <ResponsiveContainer>
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                  <XAxis
                    dataKey="weekLabel"
                    label={{
                      value: "Semaine de la saison",
                      position: "insideBottom",
                      offset: -5,
                    }}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    label={{
                      value: "Nombre d'hospitalisations",
                      angle: -90,
                      position: "insideLeft",
                    }}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                    }}
                    labelStyle={{ fontWeight: "bold" }}
                  />
                  <Legend
                    wrapperStyle={{
                      paddingTop: "20px",
                    }}
                  />
                  {seasons.map((season) => (
                    <Line
                      key={season}
                      type="monotone"
                      dataKey={season}
                      stroke={SEASON_COLORS[season]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                      name={season}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            <p className="fr-text--xs fr-mt-4w" style={{ color: "#666" }}>
              Source : <a href="https://odisse.santepubliquefrance.fr" target="_blank" rel="noopener noreferrer">Santé Publique France (ODISSE)</a> • Données hebdomadaires
              d&apos;hospitalisations
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
