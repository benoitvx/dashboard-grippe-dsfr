import { ApiResponse } from "@/types/grippe.types";

const IQVIA_CAMPAGNE_CSV_URL =
  "https://www.data.gouv.fr/api/1/datasets/r/55433247-6918-49d9-a2d2-bc760e1a38a8";

// Mock historical data for past campaigns (weekly cumulative doses)
// TODO: Replace with real data by parsing doses-actes daily files
const MOCK_HISTORICAL_DATA: Record<string, number[]> = {
  // Each array has 26 weeks (S40-S13) with cumulative doses
  "2020-2021": [
    380000, 850000, 1400000, 2000000, 2700000, 3400000, 4100000, 4750000,
    5350000, 5900000, 6400000, 6800000, 7100000, 7350000, 7550000, 7700000,
    7850000, 7950000, 8050000, 8120000, 8180000, 8220000, 8250000, 8270000,
    8285000, 8295000,
  ],
  "2021-2022": [
    420000, 920000, 1550000, 2250000, 3050000, 3900000, 4750000, 5600000,
    6400000, 7100000, 7700000, 8200000, 8600000, 8950000, 9250000, 9500000,
    9700000, 9850000, 9950000, 10030000, 10100000, 10150000, 10180000,
    10200000, 10215000, 10225000,
  ],
  "2022-2023": [
    400000, 900000, 1500000, 2200000, 3000000, 3800000, 4600000, 5300000,
    6000000, 6600000, 7100000, 7500000, 7800000, 8000000, 8200000, 8300000,
    8400000, 8450000, 8500000, 8530000, 8550000, 8560000, 8570000, 8575000,
    8580000, 8582000,
  ],
  "2023-2024": [
    450000, 1000000, 1700000, 2400000, 3200000, 4100000, 5000000, 5900000,
    6700000, 7400000, 8000000, 8500000, 8900000, 9200000, 9500000, 9700000,
    9900000, 10000000, 10100000, 10200000, 10300000, 10400000, 10450000,
    10480000, 10500000, 10510000,
  ],
  "2024-2025": [
    430000, 950000, 1600000, 2300000, 3100000, 3900000, 4700000, 5500000,
    6300000, 7000000, 7600000, 8100000, 8500000, 8900000, 9200000, 9500000,
    9700000, 9850000, 9950000, 10020000, 10070000, 10100000, 10120000,
    10130000, 10140000, 10143000,
  ],
};

// Mock historical data for vaccination acts (VGP) - typically 60-70% of doses
const MOCK_ACTES_DATA: Record<string, number[]> = {
  "2020-2021": [
    240000, 560000, 920000, 1300000, 1750000, 2200000, 2650000, 3050000,
    3450000, 3800000, 4120000, 4380000, 4580000, 4740000, 4870000, 4970000,
    5060000, 5130000, 5190000, 5240000, 5280000, 5310000, 5335000, 5350000,
    5360000, 5365000,
  ],
  "2021-2022": [
    260000, 600000, 1000000, 1450000, 1950000, 2500000, 3050000, 3600000,
    4100000, 4550000, 4950000, 5280000, 5540000, 5760000, 5960000, 6120000,
    6250000, 6350000, 6420000, 6480000, 6520000, 6555000, 6580000, 6600000,
    6610000, 6615000,
  ],
  "2022-2023": [
    250000, 600000, 1000000, 1450000, 1950000, 2450000, 2950000, 3400000,
    3850000, 4250000, 4600000, 4850000, 5050000, 5200000, 5300000, 5380000,
    5450000, 5480000, 5500000, 5520000, 5535000, 5545000, 5550000, 5553000,
    5555000, 5556000,
  ],
  "2023-2024": [
    280000, 650000, 1100000, 1550000, 2050000, 2600000, 3200000, 3750000,
    4250000, 4700000, 5100000, 5400000, 5650000, 5850000, 6000000, 6150000,
    6250000, 6320000, 6380000, 6430000, 6470000, 6500000, 6530000, 6550000,
    6560000, 6565000,
  ],
  "2024-2025": [
    270000, 630000, 1050000, 1500000, 2000000, 2500000, 3000000, 3500000,
    4000000, 4450000, 4850000, 5150000, 5400000, 5650000, 5850000, 6000000,
    6150000, 6250000, 6330000, 6390000, 6430000, 6460000, 6480000, 6490000,
    6495000, 6497000,
  ],
};

interface IqviaCampagneRow {
  campagne: string;
  date: string;
  variable: string;
  valeur: number;
  cible: number;
}

function parseCSV(csv: string): IqviaCampagneRow[] {
  const lines = csv.trim().split("\n");
  const headers = lines[0].split(",");

  return lines.slice(1).map((line) => {
    const values = line.split(",");
    return {
      campagne: values[0],
      date: values[1],
      variable: values[2],
      valeur: parseInt(values[3]),
      cible: parseInt(values[4]),
    };
  });
}

export async function fetchVaccinationKPI(): Promise<
  ApiResponse<{
    totalDoses: number;
    lastUpdateDate: string;
    previousCampaign: number;
    variation: number;
  }>
> {
  try {
    console.log("🔍 Fetching IQVIA vaccination data...");

    const response = await fetch(IQVIA_CAMPAGNE_CSV_URL, {
      headers: {
        Accept: "text/csv",
      },
      next: { revalidate: 86400 }, // Cache for 24 hours (updated weekly)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const csvText = await response.text();
    console.log("📄 IQVIA CSV fetched:", csvText.substring(0, 200));

    const rows = parseCSV(csvText);
    console.log("📊 Parsed rows:", rows);

    // Find the DOSES row
    const dosesRow = rows.find((row) => row.variable === "DOSES(J07E1)");

    if (!dosesRow) {
      throw new Error("DOSES data not found in CSV");
    }

    const totalDoses = dosesRow.valeur;
    const previousCampaign = dosesRow.cible;
    const variation =
      previousCampaign > 0
        ? ((totalDoses - previousCampaign) / previousCampaign) * 100
        : 0;

    console.log(`✅ Total doses: ${totalDoses.toLocaleString("fr-FR")}`);
    console.log(
      `📈 Variation vs previous campaign: ${variation.toFixed(1)}%`
    );

    return {
      data: {
        totalDoses,
        lastUpdateDate: dosesRow.date,
        previousCampaign,
        variation,
      },
    };
  } catch (error) {
    console.error("Error fetching IQVIA vaccination data:", error);
    return {
      data: {
        totalDoses: 0,
        lastUpdateDate: "N/A",
        previousCampaign: 0,
        variation: 0,
      },
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function fetchVaccinationHistorique(): Promise<
  ApiResponse<Record<string, number[]>>
> {
  try {
    console.log("🔍 Fetching vaccination evolution data...");

    const seasons = [
      "2020-2021",
      "2021-2022",
      "2022-2023",
      "2023-2024",
      "2024-2025",
      "2025-2026",
    ];
    const result: Record<string, number[]> = {};

    // For historical seasons, use mock data
    seasons.slice(0, 5).forEach((season) => {
      result[season] = MOCK_HISTORICAL_DATA[season];
    });

    // For current season (2025-2026), project from current total
    // We have ~7 weeks of data based on the current date (mid-November)
    const currentWeek = 7; // Approximately week 7 of the campaign (started mid-October)
    const currentTotal = 7932585; // From the KPI data

    // Project a realistic growth curve for the current season
    const currentSeasonData: number[] = [];
    for (let week = 0; week < 26; week++) {
      if (week < currentWeek) {
        // Estimated weekly growth for past weeks
        const weeklyGrowth = [
          450000, 1000000, 1700000, 2500000, 3400000, 4400000, 5500000,
        ];
        currentSeasonData.push(weeklyGrowth[week] || currentTotal);
      } else if (week === currentWeek) {
        currentSeasonData.push(currentTotal);
      } else {
        // Future weeks: null
        currentSeasonData.push(null as any);
      }
    }

    result["2025-2026"] = currentSeasonData;

    console.log("✅ Vaccination evolution data prepared for 6 seasons");
    console.log(
      "📊 Data points:",
      Object.entries(result).map(([s, d]) => [
        s,
        d.filter((v) => v !== null).length,
      ])
    );

    return {
      data: result,
    };
  } catch (error) {
    console.error("Error fetching vaccination evolution:", error);
    return {
      data: {},
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function fetchActesPharmacie(): Promise<
  ApiResponse<Record<string, number[]>>
> {
  try {
    console.log("🔍 Fetching pharmacy vaccination acts data...");

    const seasons = [
      "2020-2021",
      "2021-2022",
      "2022-2023",
      "2023-2024",
      "2024-2025",
      "2025-2026",
    ];
    const result: Record<string, number[]> = {};

    // For historical seasons, use mock data
    seasons.slice(0, 5).forEach((season) => {
      result[season] = MOCK_ACTES_DATA[season];
    });

    // For current season (2025-2026), project from current total
    const currentWeek = 7; // Approximately week 7 of the campaign
    const currentTotalActes = 4934349; // From the KPI data (ACTE VGP)

    // Project a realistic growth curve for the current season
    const currentSeasonData: number[] = [];
    for (let week = 0; week < 26; week++) {
      if (week < currentWeek) {
        // Estimated weekly growth for past weeks (actes are ~60-70% of doses)
        const weeklyGrowth = [
          280000, 650000, 1100000, 1600000, 2150000, 2750000, 3400000,
        ];
        currentSeasonData.push(weeklyGrowth[week] || currentTotalActes);
      } else if (week === currentWeek) {
        currentSeasonData.push(currentTotalActes);
      } else {
        // Future weeks: null
        currentSeasonData.push(null as any);
      }
    }

    result["2025-2026"] = currentSeasonData;

    console.log("✅ Pharmacy acts data prepared for 6 seasons");
    console.log(
      "📊 Data points:",
      Object.entries(result).map(([s, d]) => [
        s,
        d.filter((v) => v !== null).length,
      ])
    );

    return {
      data: result,
    };
  } catch (error) {
    console.error("Error fetching pharmacy acts:", error);
    return {
      data: {},
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
