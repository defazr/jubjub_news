// Minimal scheduled function that triggers the Next.js API route
const SITE_URL = process.env.URL || process.env.DEPLOY_URL || "https://headlines.fazr.co.kr";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export default async (req: Request) => {
  console.log("news-ingest function triggered");
  console.log("SITE_URL:", SITE_URL);
  console.log("Has SUPABASE_SERVICE_KEY:", !!SUPABASE_SERVICE_KEY);

  if (!SITE_URL) {
    return new Response(JSON.stringify({ error: "No site URL" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const secret = SUPABASE_SERVICE_KEY.slice(0, 16);
  const url = `${SITE_URL}/api/news-ingest?secret=${secret}`;
  console.log("Calling:", url.replace(secret, "***"));

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
