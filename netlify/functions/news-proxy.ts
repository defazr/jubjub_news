const RAPIDAPI_KEY = "7ceb526388msh21a88d2b61d4eebp16fd2bjsn23f1646f4e42";
const RAPIDAPI_HOST = "news-api14.p.rapidapi.com";

export default async (req: Request) => {
  const url = new URL(req.url);
  const endpoint = url.searchParams.get("endpoint");
  const query = url.searchParams.get("query") || "";
  const topic = url.searchParams.get("topic") || "";

  let apiUrl = "";

  if (endpoint === "trending") {
    const t = topic && topic !== "general" ? topic : "General";
    apiUrl = `https://${RAPIDAPI_HOST}/v2/trendings?topic=${encodeURIComponent(t)}&language=ko`;
  } else if (endpoint === "search") {
    apiUrl = `https://${RAPIDAPI_HOST}/v2/search/articles?query=${encodeURIComponent(query)}&language=ko`;
  } else {
    return new Response(JSON.stringify({ error: "Invalid endpoint" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const res = await fetch(apiUrl, {
      headers: {
        "x-rapidapi-host": RAPIDAPI_HOST,
        "x-rapidapi-key": RAPIDAPI_KEY,
      },
    });

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=300",
      },
    });
  } catch {
    return new Response(JSON.stringify({ success: false, data: [] }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
