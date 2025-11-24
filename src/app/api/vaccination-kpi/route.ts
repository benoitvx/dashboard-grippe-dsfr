import { fetchVaccinationKPI } from "@/lib/api/iqvia";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await fetchVaccinationKPI();
  return NextResponse.json(result);
}
