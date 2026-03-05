const RAPIDAPI_KEY = "7ceb526388msh21a88d2b61d4eebp16fd2bjsn23f1646f4e42";
const RAPIDAPI_HOST = "real-time-news-data.p.rapidapi.com";

export default async (req: Request) => {
  const url = new URL(req.url);
  const endpoint = url.searchParams.get("endpoint");
  const query = url.searchParams.get("query") || "";
  const topic = url.searchParams.get("topic") || "";

  let apiUrl = "";

  if (endpoint === "trending") {
    apiUrl = `https://${RAPIDAPI_HOST}/top-headlines?country=KR&lang=ko${topic && topic !== "general" ? `&topic=${topic}` : ""}`;
  } else if (endpoint === "search") {
    apiUrl = `https://${RAPIDAPI_HOST}/search?query=${encodeURIComponent(query)}&country=KR&lang=ko`;
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
    return new Response(JSON.stringify({ status: "error", data: [] }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
