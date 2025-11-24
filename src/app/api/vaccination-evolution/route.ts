import { fetchVaccinationHistorique } from "@/lib/api/iqvia";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await fetchVaccinationHistorique();
  return NextResponse.json(result);
}
