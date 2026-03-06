const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "";
const RAPIDAPI_HOST = "news-api14.p.rapidapi.com";

// Surrogate pair / replacement char 깨진 유니코드 제거
function sanitizeText(text: string): string {
  // Remove lone surrogates, replacement characters, and other broken Unicode
  return text
    .replace(/[\uFFFD\uFFFE\uFFFF]/g, "")
    .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/g, "")
    .replace(/(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, "");
}

function sanitizeArticles(data: Record<string, unknown>): Record<string, unknown> {
  const json = JSON.stringify(data);
  return JSON.parse(sanitizeText(json));
}

export default async (req: Request) => {
  const url = new URL(req.url);
  const endpoint = url.searchParams.get("endpoint");
  const query = url.searchParams.get("query") || "";
  const topic = url.searchParams.get("topic") || "";
  const language = url.searchParams.get("language") || "ko";

  let apiUrl = "";

  if (endpoint === "trending") {
    const t = topic && topic !== "general" ? topic : "General";
    apiUrl = `https://${RAPIDAPI_HOST}/v2/trendings?topic=${encodeURIComponent(t)}&language=${language}`;
  } else if (endpoint === "search") {
    apiUrl = `https://${RAPIDAPI_HOST}/v2/search/articles?query=${encodeURIComponent(query)}&language=${language}`;
  } else {
    return new Response(JSON.stringify({ error: "Invalid endpoint" }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  try {
    const res = await fetch(apiUrl, {
      headers: {
        "x-rapidapi-host": RAPIDAPI_HOST,
        "x-rapidapi-key": RAPIDAPI_KEY,
      },
    });

    // Read as text first to handle potential encoding issues
    const rawText = await res.text();
    const sanitized = sanitizeText(rawText);
    const data = JSON.parse(sanitized);

    return new Response(JSON.stringify(sanitizeArticles(data)), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=300",
      },
    });
  } catch {
    return new Response(JSON.stringify({ success: false, data: [] }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }
};
