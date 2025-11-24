import { SentiwebData, ApiResponse, RegionData } from "@/types/grippe.types";

const SENTIWEB_API_URL =
  "https://www.sentiweb.fr/api/v1/datasets/rest/dataset?id=inc-3-PAY&span=short&$format=json";

const SENTIWEB_API_REG_URL =
  "https://www.sentiweb.fr/api/v1/datasets/rest/dataset?id=inc-3-RDD&span=last&$format=json";

const SENTIWEB_API_ALL_URL =
  "https://www.sentiweb.fr/api/v1/datasets/rest/dataset?id=inc-3-PAY&span=all&$format=json";

interface SentiwebApiRecord {
  week: string | number; // Format YYYYWW (ex: 202447)
  inc100: number; // Taux d'incidence pour 100k habitants
  inc: number; // Nombre de cas bruts
  geo_insee?: string; // Code géographique INSEE
  geo_name?: string; // Nom de la zone géographique
}

export async function fetchIncidenceNationale(): Promise<
  ApiResponse<SentiwebData>
> {
  try {
    console.log("Fetching from URL:", SENTIWEB_API_URL);

    const response = await fetch(SENTIWEB_API_URL, {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    console.log("=== SENTIWEB RAW RESPONSE ===");
    console.log(text);
    console.log("=== END ===");

    const apiResponse = JSON.parse(text);
    console.log("Parsed API response:", apiResponse);

    // API returns { meta: {...}, data: [...] }
    const records: SentiwebApiRecord[] = apiResponse.data;

    if (!Array.isArray(records) || records.length === 0) {
      throw new Error("Invalid API response format");
    }

    console.log("Records array:", records);

    // Sort by week to ensure we get the most recent data
    const sortedRecords = records.sort((a, b) => {
      const weekA = parseInt(String(a.week));
      const weekB = parseInt(String(b.week));
      return weekB - weekA;
    });

    // Get the latest week (most recent)
    const latestWeek = sortedRecords[0];
    const previousWeek = sortedRecords[1];

    // Calculate variation vs previous week
    const variation =
      previousWeek && previousWeek.inc100 > 0
        ? ((latestWeek.inc100 - previousWeek.inc100) / previousWeek.inc100) *
          100
        : 0;

    // Format week as YYYY-S## (e.g., 202447 -> 2024-S47)
    const weekString = String(latestWeek.week);
    const year = weekString.substring(0, 4);
    const weekNum = weekString.substring(4);
    const formattedWeek = `${year}-S${weekNum}`;

    return {
      data: {
        incidence: Math.round(latestWeek.inc100),
        semaine: formattedWeek,
        variation: Math.round(variation * 10) / 10, // Round to 1 decimal
      },
    };
  } catch (error) {
    console.error("Error fetching Sentiweb data:", error);
    return {
      data: {
        incidence: 0,
        semaine: "N/A",
        variation: 0,
      },
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function fetchIncidenceRegions(): Promise<
  ApiResponse<RegionData[]>
> {
  try {
    console.log("Fetching regions from URL:", SENTIWEB_API_REG_URL);

    const response = await fetch(SENTIWEB_API_REG_URL, {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    const apiResponse = JSON.parse(text);

    // API returns { meta: {...}, data: [...] }
    const records: SentiwebApiRecord[] = apiResponse.data;

    if (!Array.isArray(records) || records.length === 0) {
      throw new Error("Invalid API response format");
    }

    // Transform records to RegionData
    const regions: RegionData[] = records
      .filter((record) => record.geo_insee && record.geo_insee !== "FR")
      .map((record) => ({
        code: String(record.geo_insee || ""), // Force conversion to string
        nom: record.geo_name || "",
        incidence: Math.round(record.inc100),
      }));

    console.log(`✅ Fetched ${regions.length} regions:`, regions.map(r => `${r.code}:${r.incidence}`).join(', '));

    return {
      data: regions,
    };
  } catch (error) {
    console.error("Error fetching regions data:", error);
    return {
      data: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function fetchEvolutionHistorique(): Promise<
  ApiResponse<Record<string, number[]>>
> {
  try {
    console.log("Fetching evolution from URL:", SENTIWEB_API_ALL_URL);

    const response = await fetch(SENTIWEB_API_ALL_URL, {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    const apiResponse = JSON.parse(text);

    // API returns { meta: {...}, data: [...] }
    const records: SentiwebApiRecord[] = apiResponse.data;

    if (!Array.isArray(records) || records.length === 0) {
      throw new Error("Invalid API response format");
    }

    // Indexer toutes les données par YYYYWW pour accès rapide
    const dataIndex = new Map<string, number>();
    records.forEach((record) => {
      const weekString = String(record.week);
      dataIndex.set(weekString, Math.round(record.inc100));
    });

    // Construire les saisons (Oct-Mars)
    const seasons = [
      "2022-2023",
      "2023-2024",
      "2024-2025",
      "2025-2026",
    ];

    const result: Record<string, number[]> = {};

    seasons.forEach((season) => {
      const [startYear, endYear] = season.split("-").map((y) => parseInt(y));
      const seasonData: number[] = [];

      // Semaines 40-52 de l'année de début
      for (let week = 40; week <= 52; week++) {
        const weekKey = `${startYear}${week.toString().padStart(2, "0")}`;
        seasonData.push(dataIndex.get(weekKey) || 0);
      }

      // Semaines 1-13 de l'année de fin
      for (let week = 1; week <= 13; week++) {
        const weekKey = `${endYear}${week.toString().padStart(2, "0")}`;
        seasonData.push(dataIndex.get(weekKey) || 0);
      }

      result[season] = seasonData;
    });

    console.log(
      `✅ Fetched evolution data for seasons:`,
      Object.keys(result).join(", ")
    );
    console.log(
      `📊 Data points per season:`,
      Object.values(result).map((d) => d.length)
    );

    return {
      data: result,
    };
  } catch (error) {
    console.error("Error fetching evolution data:", error);
    return {
      data: {},
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
