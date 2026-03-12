import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const revalidate = 300; // 5min cache

const TOPICS = ["ai", "apple", "nvidia", "semiconductor", "crypto"] as const;

export async function GET() {
  try {
    const now = new Date().toISOString();
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
    });
  } catch {
    return NextResponse.json(
      { status: "error", message: "database error" },
      { status: 500 }
    );
  }
}
