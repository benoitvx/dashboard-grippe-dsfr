import { fetchIncidenceNationale } from "@/lib/api/sentiweb";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await fetchIncidenceNationale();
  return NextResponse.json(result);
}
