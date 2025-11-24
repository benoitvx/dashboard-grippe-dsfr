import { fetchHospitalisations } from "@/lib/api/odisse";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await fetchHospitalisations();
  return NextResponse.json(result);
}
