import { fetchActesPharmacie } from "@/lib/api/iqvia";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await fetchActesPharmacie();
  return NextResponse.json(result);
}
