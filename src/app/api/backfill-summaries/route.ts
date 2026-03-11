import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";
const INGEST_SECRET = process.env.INGEST_SECRET || "";

async function generateSummary(title: string, excerpt: string): Promise<string | null> {
  if (!ANTHROPIC_API_KEY || !excerpt) return null;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 150,
        messages: [
          {
            role: "user",
            content: `Summarize this news article in 2-3 sentences (50-80 words). Focus on key facts only.\n\nTitle: ${title}\n\nExcerpt: ${excerpt}`,
          },
        ],
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const text = data.content?.[0]?.text;
    return text || null;
  } catch {
    return null;
  }
}

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  try {
    const secret = req.nextUrl.searchParams.get("secret");
    if (!secret || secret !== INGEST_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: "Missing Supabase config" }, { status: 500 });
    }

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "Missing ANTHROPIC_API_KEY" }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50", 10);
    const BATCH_SIZE = 10;

    // Fetch articles without summaries
    const { data: articles, error } = await supabase
      .from("articles")
      .select("id, title, excerpt")
      .is("summary", null)
      .not("excerpt", "is", null)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!articles || articles.length === 0) {
      return NextResponse.json({ success: true, message: "All articles already have summaries", processed: 0 });
    }

    const stats = { total: articles.length, success: 0, failed: 0 };

    // Process in batches of 10
    for (let i = 0; i < articles.length; i += BATCH_SIZE) {
      const batch = articles.slice(i, i + BATCH_SIZE);

      const results = await Promise.allSettled(
        batch.map(async (article) => {
          const summary = await generateSummary(article.title, article.excerpt!);
          if (summary) {
            const { error: updateError } = await supabase
              .from("articles")
              .update({ summary })
              .eq("id", article.id);

            if (updateError) {
              stats.failed++;
              return;
            }
            stats.success++;
          } else {
            stats.failed++;
          }
        })
      );

      for (const r of results) {
        if (r.status === "rejected") {
          stats.failed++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
