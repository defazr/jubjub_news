import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const revalidate = 3600; // 1 hour cache (reduced writes)
export const dynamic = "force-dynamic";

const TOPICS = ["ai", "apple", "nvidia", "semiconductor", "crypto"] as const;

export async function GET() {
  // Debug: check env availability (no secrets exposed)
  const envCheck = {
    SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    INGEST_SECRET: !!process.env.INGEST_SECRET,
    RAPIDAPI_KEY: !!process.env.RAPIDAPI_KEY,
    ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
  };
  console.log("[NEWS-STATUS] env check:", envCheck);

  try {
    const h24 = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const h1 = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const [totalRes, last24hRes, lastHourRes, latestRes] = await Promise.all([
      supabase.from("articles").select("*", { count: "exact", head: true }),
      supabase
        .from("articles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", h24),
      supabase
        .from("articles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", h1),
      supabase
        .from("articles")
        .select("created_at")
        .order("created_at", { ascending: false })
        .limit(1),
    ]);

    // Log any DB errors
    if (totalRes.error) console.error("[NEWS-STATUS] totalRes error:", totalRes.error);
    if (latestRes.error) console.error("[NEWS-STATUS] latestRes error:", latestRes.error);

    // Topic counts in parallel
    const topicEntries = await Promise.all(
      TOPICS.map(async (topic) => {
        const { count } = await supabase
          .from("articles")
          .select("*", { count: "exact", head: true })
          .contains("keywords", [topic]);
        return [topic, count ?? 0] as const;
      })
    );

    const latestRow = latestRes.data?.[0] as
      | { created_at: string }
      | undefined;
    const latestTime = latestRow?.created_at ?? null;

    const ingestOk =
      latestTime !== null &&
      new Date(latestTime).getTime() > Date.now() - 2 * 60 * 60 * 1000;

    console.log("[NEWS-STATUS] result:", {
      articles_total: totalRes.count ?? 0,
      latest_article_time: latestTime,
      ingest_ok: ingestOk,
    });

    return NextResponse.json({
      status: "ok",
      articles_total: totalRes.count ?? 0,
      articles_last_24h: last24hRes.count ?? 0,
      articles_last_hour: lastHourRes.count ?? 0,
      latest_article_time: latestTime,
      topics: Object.fromEntries(topicEntries),
      pipeline: {
        last_ingest: latestTime,
        ingest_ok: ingestOk,
      },
      env_check: envCheck,
    });
  } catch (err) {
    console.error("[NEWS-STATUS] unexpected error:", err);
    return NextResponse.json(
      { status: "error", message: "database error", env_check: {
        SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      }},
      { status: 500 }
    );
  }
}
