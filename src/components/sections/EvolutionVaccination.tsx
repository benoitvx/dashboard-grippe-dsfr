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
  "2020-2021": "#6A6AF4", // Violet Glycine
  "2021-2022": "#C9191E", // Rouge Cerise
  "2022-2023": "#000091", // Bleu France
  "2023-2024": "#009081", // Vert Archipel
  "2024-2025": "#CE614A", // Orange Terre Battue
  "2025-2026": "#E1000F", // Rouge Marianne
};

export function EvolutionVaccination() {
  const { data, error, isLoading } = useSWR<
    ApiResponse<Record<string, number[]>>
  >("/api/vaccination-evolution", fetcher, {
    refreshInterval: 86400000, // Refresh every 24 hours
    revalidateOnFocus: false,
  });

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
        <p>Chargement du graphique de vaccination...</p>
      </div>
    );
  }

  const evolutionData = data?.data || {};
  const seasons = Object.keys(evolutionData).sort();

  if (seasons.length === 0) {
    return (
      <div className="fr-callout">
        <p className="fr-callout__text">
          Aucune donnée de vaccination disponible
        </p>
      </div>
    );
  }

  // Transformer les données pour Recharts
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

      // Ne pas ajouter la propriété si la valeur est null ou 0
      if (value && value > 0) {
        dataPoint[season] = value;
      }
    });

    chartData.push(dataPoint);
  }

  // Custom tooltip formatter to show doses in millions
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "#fff",
            border: "1px solid #ddd",
            borderRadius: "4px",
            padding: "10px",
          }}
        >
          <p style={{ fontWeight: "bold", marginBottom: "5px" }}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color, margin: "2px 0" }}>
              {entry.name}:{" "}
              {(entry.value / 1000000).toLocaleString("fr-FR", {
                maximumFractionDigits: 2,
              })}{" "}
              M doses
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <section className="fr-py-6w">
      <h2 className="fr-h2 fr-mb-3w">Comment avance la campagne de vaccination ?</h2>
      <details style={{ marginBottom: '1rem', border: '1px solid #ddd', padding: '1rem', borderRadius: '4px' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem', color: '#000091' }}>
          Comment lire ce graphique ?
        </summary>
        <div style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
          <p>
            Ce graphique compare l'évolution de la couverture vaccinale entre les différentes campagnes. Il permet de voir si la vaccination avance plus ou moins vite que les années précédentes.
          </p>
        </div>
      </details>
      <div className="fr-card fr-card--no-border fr-card--shadow" style={{ marginTop: "1rem" }}>
        <div className="fr-card__body">
          <div className="fr-card__content">
            <p className="fr-text--sm fr-mb-4w">
              Doses de vaccin grippe délivrées cumulées par saison (octobre à
              mars)
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
                      value: "Doses délivrées (millions)",
                      angle: -90,
                      position: "insideLeft",
                    }}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) =>
                      `${(value / 1000000).toFixed(0)}M`
                    }
                  />
                  <Tooltip content={<CustomTooltip />} />
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
              Source : <a href="https://www.data.gouv.fr/fr/organizations/iqvia-france/" target="_blank" rel="noopener noreferrer">IQVIA</a> - Données hebdomadaires des pharmacies • Campagnes
              2020-2021 à 2025-2026
            </p>
            <p className="fr-text--xs" style={{ color: "#999", fontStyle: "italic" }}>
              Note : Données historiques 2020-2025 estimées à partir des
              totaux de campagne. Campagne 2025-2026 en cours avec données
              réelles.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
