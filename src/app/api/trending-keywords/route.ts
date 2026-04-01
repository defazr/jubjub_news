import { NextResponse } from "next/server";
import { getPopularKeywords } from "@/lib/articles";

export const revalidate = 1800; // ISR: 30 minutes (reduced writes)

export async function GET() {
  const keywords = await getPopularKeywords(15);
  return NextResponse.json({ keywords });
}
