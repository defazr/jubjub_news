import { NextRequest, NextResponse } from "next/server";

const RAPIDAPI_KEY = "7ceb526388msh21a88d2b61d4eebp16fd2bjsn23f1646f4e42";
const RAPIDAPI_HOST = "real-time-news-data.p.rapidapi.com";

const headers = {
  "x-rapidapi-host": RAPIDAPI_HOST,
  "x-rapidapi-key": RAPIDAPI_KEY,
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "headlines";
  const query = searchParams.get("query") || "";

  let url: string;
  if (type === "search") {
    url = `https://${RAPIDAPI_HOST}/search?query=${encodeURIComponent(query)}&country=KR&lang=ko`;
  } else {
    url = `https://${RAPIDAPI_HOST}/top-headlines?country=KR&lang=ko`;
  }

  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      return NextResponse.json({ status: "ERROR", data: [] }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ status: "ERROR", data: [] }, { status: 500 });
  }
}
