import { fetchEvolutionHistorique } from "@/lib/api/sentiweb";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await fetchEvolutionHistorique();
  return NextResponse.json(result);
}
