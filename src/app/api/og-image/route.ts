import { NextRequest, NextResponse } from "next/server";

const FALLBACK_URL = "https://headlines.fazr.co.kr/Headlines_Fazr_OG_image.png";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.redirect(FALLBACK_URL);
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; HeadlinesFazrBot/1.0)",
        Accept: "image/*",
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return NextResponse.redirect(FALLBACK_URL);
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) {
      return NextResponse.redirect(FALLBACK_URL);
    }

    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch {
    return NextResponse.redirect(FALLBACK_URL);
  }
}
