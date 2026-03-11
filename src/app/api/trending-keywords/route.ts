import { NextResponse } from "next/server";
import { getPopularKeywords } from "@/lib/articles";

export const revalidate = 600; // ISR: 10 minutes

export async function GET() {
  const keywords = await getPopularKeywords(15);
  return NextResponse.json({ keywords });
}
