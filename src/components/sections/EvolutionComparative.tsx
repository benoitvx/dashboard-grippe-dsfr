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

export function EvolutionComparative() {
  const { data, error, isLoading } = useSWR<
    ApiResponse<Record<string, number[]>>
  >("/api/evolution", fetcher, {
    refreshInterval: 3600000, // Refresh every hour
    revalidateOnFocus: false,
  });

  if (error) {
    return (
      <div className="fr-callout fr-callout--red-bourgeon">
        <p className="fr-callout__text">
          Erreur lors du chargement des données d&apos;évolution
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="fr-card fr-p-4w" style={{ textAlign: "center" }}>
        <p>Chargement du graphique d&apos;évolution...</p>
      </div>
    );
  }

  const evolutionData = data?.data || {};
  const seasons = Object.keys(evolutionData).sort();

  if (seasons.length === 0) {
    return (
      <div className="fr-callout">
        <p className="fr-callout__text">
          Aucune donnée d&apos;évolution disponible
        </p>
      </div>
    );
  }

  // Transformer les données pour Recharts
  // Format: [{ week: 0, "2022-2023": 127, "2023-2024": 95, ... }, ...]
  const maxLength = Math.max(
    ...Object.values(evolutionData).map((arr) => arr.length)
  );

  const chartData = [];
  for (let i = 0; i < maxLength; i++) {
    const dataPoint: Record<string, number | string> = {
      week: i,
      weekLabel: i < 13 ? `S${40 + i}` : `S${i - 13 + 1}`,
    };

    seasons.forEach((season) => {
      const seasonData = evolutionData[season];
      const value = seasonData[i];

      // Ne pas ajouter la propriété si la valeur est 0 ou undefined
      // Cela permet à Recharts de ne pas tracer de point pour les semaines futures
      if (value && value > 0) {
        dataPoint[season] = value;
      }
    });

    chartData.push(dataPoint);
  }

  console.log("📊 Recharts data prepared:", {
    seasons,
    dataPoints: chartData.length,
    sampleData: chartData.slice(0, 3),
  });

  return (
    <section className="fr-py-6w">
      <h2 className="fr-h2 fr-mb-3w">Comment évolue l'épidémie cette année ?</h2>
      <details style={{ marginBottom: '1rem', border: '1px solid #ddd', padding: '1rem', borderRadius: '4px' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem', color: '#000091' }}>
          Comment interpréter ce graphique ?
        </summary>
        <div style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
          <p>
            Ce graphique compare l'évolution de l'épidémie actuelle avec les saisons précédentes. Il permet d'anticiper si le pic épidémique approche ou est déjà passé, et de mesurer l'intensité relative de la saison en cours.
          </p>
        </div>
      </details>
      <div className="fr-card fr-card--no-border fr-card--shadow" style={{ marginTop: "1rem" }}>
        <div className="fr-card__body">
          <div className="fr-card__content">
            <p className="fr-text--sm fr-mb-4w">
              Comparaison de l&apos;incidence hebdomadaire par saison grippale
              (octobre à mars)
            </p>

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
                      value: "Incidence (cas / 100k hab.)",
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
              Source : <a href="https://www.sentiweb.fr" target="_blank" rel="noopener noreferrer">Réseau Sentiweb</a> • Saisons grippales 2022-2023 à
              2025-2026 (semaines 40 à 13)
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
