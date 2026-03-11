// Minimal scheduled function that triggers the Next.js API route
const SITE_URL = process.env.URL || process.env.DEPLOY_URL || "https://headlines.fazr.co.kr";
const INGEST_SECRET = process.env.INGEST_SECRET || "";

export default async (req: Request) => {
  console.log("news-ingest function triggered");
  console.log("SITE_URL:", SITE_URL);
  console.log("Has INGEST_SECRET:", !!INGEST_SECRET);

  if (!SITE_URL || !INGEST_SECRET) {
    return new Response(
      JSON.stringify({ error: "Missing SITE_URL or INGEST_SECRET" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const url = `${SITE_URL}/api/news-ingest?secret=${INGEST_SECRET}`;
  console.log("Calling news-ingest API...");

  try {
    const res = await fetch(url);
    const text = await res.text();
    console.log(`news-ingest response [${res.status}]:`, text.slice(0, 500));

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = {
        error: "Non-JSON response from API route",
        status: res.status,
        body: text.slice(0, 200),
      };
    }

    return new Response(JSON.stringify(data), {
      status: res.status >= 200 && res.status < 300 ? 200 : res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Failed to trigger news-ingest:", message);
    return new Response(
      JSON.stringify({ error: "Failed to trigger news-ingest", message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};

export const config = {
  schedule: "0 */4 * * *",
};
