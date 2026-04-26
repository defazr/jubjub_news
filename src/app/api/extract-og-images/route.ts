import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { extractOgImage } from "@/lib/ogImageExtractor";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";
const INGEST_SECRET = process.env.INGEST_SECRET || "";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (!secret || secret !== INGEST_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return NextResponse.json(
      { error: "Missing Supabase config" },
      { status: 500 }
    );
  }

  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "30", 10);
  const startTime = Date.now();

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // image_url IS NULL인 기사만 조회
  const { data: articles, error } = await supabase
    .from("articles")
    .select("id, source_url")
    .is("image_url", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  if (!articles || articles.length === 0) {
    return NextResponse.json({
      success: true,
      stats: { processed: 0, extracted: 0, not_found: 0, failed: 0 },
      message: "No articles need image extraction",
    });
  }

  console.log(`[OG] Started: processing ${articles.length} articles`);

  const stats = { processed: 0, extracted: 0, not_found: 0, failed: 0 };

  // 순차 처리 (병렬 X - timeout 누적 방지)
  for (const article of articles) {
    stats.processed++;

    try {
      const ogImage = await extractOgImage(article.source_url);

      if (ogImage) {
        const { error: updateError } = await supabase
          .from("articles")
          .update({ image_url: ogImage })
          .eq("id", article.id);

        if (updateError) {
          stats.failed++;
          console.error(
            `[OG] Update failed for ${article.id}: ${updateError.message}`
          );
        } else {
          stats.extracted++;
        }
      } else {
        // not_found → 빈 문자열로 마킹하여 재시도 방지
        await supabase
          .from("articles")
          .update({ image_url: "" })
          .eq("id", article.id);
        stats.not_found++;
      }
    } catch (err) {
      stats.failed++;
      console.error(`[OG] Failed for ${article.id}:`, err);
    }
  }

  const totalMs = Date.now() - startTime;
  console.log(
    `[OG] Done: extracted=${stats.extracted}, not_found=${stats.not_found}, failed=${stats.failed} (${totalMs}ms)`
  );

  return NextResponse.json({
    success: true,
    stats,
    timing: { totalMs },
    timestamp: new Date().toISOString(),
  });
}
