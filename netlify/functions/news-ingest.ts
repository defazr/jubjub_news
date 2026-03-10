// Minimal scheduled function that triggers the Next.js API route
const SITE_URL = process.env.URL || process.env.DEPLOY_URL || "https://headlines.fazr.co.kr";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export default async () => {
  if (!SITE_URL) {
    console.error("No SITE_URL available");
    return new Response(JSON.stringify({ error: "No site URL" }), { status: 500 });
  }

  const secret = SUPABASE_SERVICE_KEY.slice(0, 16);
  const url = `${SITE_URL}/api/news-ingest?secret=${secret}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log("news-ingest result:", JSON.stringify(data));
    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Failed to trigger news-ingest:", err);
    return new Response(
      JSON.stringify({ error: "Failed to trigger news-ingest" }),
      { status: 500 }
    );
  }
};

export const config = {
  schedule: "0 */4 * * *",
};
