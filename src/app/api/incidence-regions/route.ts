import { fetchIncidenceRegions } from "@/lib/api/sentiweb";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await fetchIncidenceRegions();
  return NextResponse.json(result);
}
