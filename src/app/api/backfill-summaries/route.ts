import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";
const INGEST_SECRET = process.env.INGEST_SECRET || "";

interface AiResult {
  summary: string | null;
  keywords: string[] | null;
}

const FAILED_SUMMARY_PATTERNS = [
  "i cannot", "i can't", "unable to", "i'm unable",
  "i do not have access", "i appreciate your request, but",
];

const POOR_QUALITY_PATTERNS = [
  /headline does not specify/i,
  /does not provide/i,
  /the title does not/i,
  /based on the title alone/i,
  /cannot be determined from the title/i,
  /without additional context/i,
  /though the .* does not specify/i,
  /the exact reasons (are|remain) (unclear|unknown)/i,
  /no further details/i,
  /more information (is|would be) needed/i,
  /it is unclear/i,
  /it is not clear/i,
  /no specific .* (provided|mentioned)/i,
];

function isFailedSummary(text: string): boolean {
  const lower = text.toLowerCase().trim();
  return FAILED_SUMMARY_PATTERNS.some((p) => lower.startsWith(p) || lower.includes(p));
}

function isPoorQualitySummary(summary: string): boolean {
  if (!summary) return true;
  if (summary.trim().length < 20) return true;
  return POOR_QUALITY_PATTERNS.some((p) => p.test(summary));
}

function generateFallbackSummary(title: string): string {
  const cleaned = title.trim().replace(/\.$/, "");
  return `${cleaned}.`;
}

function cleanMarkdown(summary: string): string {
  return summary
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function generateSummaryAndKeywords(title: string, excerpt: string | null): Promise<AiResult> {
  if (!ANTHROPIC_API_KEY) return { summary: generateFallbackSummary(title), keywords: null };

  const hasExcerpt = !!excerpt;
  const promptContent = hasExcerpt
    ? `You are a news editor. Given this article, produce exactly 3 sections separated by blank lines:

Line 1: A click-worthy, SEO-optimized headline (max 70 chars). Engaging for Google Discover. Do NOT repeat the original title.

Line 2+: A 2-3 sentence summary (50-80 words) focusing on key facts.

Last line: KEYWORDS: comma-separated list of 5-8 specific entities and topics (company names, people, technologies, industries). Lowercase. No generic words.

Example:
Revolutionary AI Chip Could Change Computing Forever

Scientists at MIT have developed a new neuromorphic chip that processes data 100x faster. The breakthrough could transform industries from healthcare to autonomous vehicles. Early tests show promising results in real-world applications.

KEYWORDS: mit, neuromorphic, ai chip, semiconductor, autonomous vehicles, healthcare ai

Title: ${title}

Excerpt: ${excerpt}`
    : `You are rewriting a news headline into a natural 2-3 sentence English summary.

STRICT RULES:
- Only use facts explicitly stated in the headline.
- NEVER write meta-commentary such as "the headline does not specify",
  "the exact reasons are unclear", "based on the title alone",
  "without more context", "though the headline does not", or any phrase
  explaining what the headline does or does not contain.
- If the headline lacks detail, simply restate it naturally in English.
  Do NOT explain the lack of detail.
- Always produce a complete English sentence even if information is minimal.
- No speculation, no generalization, no exaggeration.
- Output only the summary. No preamble, no disclaimer.

After the summary, add a blank line and then:
KEYWORDS: comma-separated list of 3-5 specific entities and topics from the headline. Lowercase. No generic words.

Headline: ${title}`;

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
        max_tokens: 250,
        messages: [
          {
            role: "user",
            content: promptContent,
          },
        ],
      }),
    });

    // [1차 가드] AI 호출 실패
    if (!res.ok) return { summary: generateFallbackSummary(title), keywords: null };

    const data = await res.json();
    const text = data.content?.[0]?.text;
    if (!text || text.trim() === "") return { summary: generateFallbackSummary(title), keywords: null };

    // [1차 가드] AI 거부 패턴
    if (isFailedSummary(text)) return { summary: generateFallbackSummary(title), keywords: null };

    const keywordsMatch = text.match(/^KEYWORDS:\s*(.+)$/m);
    let aiKeywords: string[] | null = null;
    let summaryText = text;

    if (keywordsMatch) {
      aiKeywords = keywordsMatch[1]
        .split(",")
        .map((k: string) => k.trim().toLowerCase())
        .filter((k: string) => k.length >= 2 && k.length <= 30);
      summaryText = text.replace(/\n*^KEYWORDS:.*$/m, "").trim();
    }

    // 마크다운 후처리
    summaryText = cleanMarkdown(summaryText);

    // [2차 가드] 품질 필터
    if (isPoorQualitySummary(summaryText)) {
      return { summary: generateFallbackSummary(title), keywords: aiKeywords };
    }

    return { summary: summaryText, keywords: aiKeywords };
  } catch {
    return { summary: generateFallbackSummary(title), keywords: null };
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
      .select("id, title, excerpt, keywords")
      .is("summary", null)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!articles || articles.length === 0) {
      return NextResponse.json({ success: true, message: "All articles already have summaries", processed: 0 });
    }

    const stats = { total: articles.length, success: 0, failed: 0 };
    const backfillLog = { success: 0, fallback_used: 0, failed_pattern: 0, failed_other: 0 };

    // Process in batches of 10
    for (let i = 0; i < articles.length; i += BATCH_SIZE) {
      const batch = articles.slice(i, i + BATCH_SIZE);

      const results = await Promise.allSettled(
        batch.map(async (article) => {
          const aiResult = await generateSummaryAndKeywords(article.title, article.excerpt ?? null);
          // summary is always non-null now (fallback guarantee)
          const summary = aiResult.summary || generateFallbackSummary(article.title);
          const isFallback = summary === generateFallbackSummary(article.title);
          const updateData: Record<string, unknown> = { summary };

          // Merge AI keywords with existing ones
          if (aiResult.keywords && aiResult.keywords.length > 0) {
            const existing = (article.keywords as string[]) || [];
            const seen = new Set(aiResult.keywords);
            const merged = [...aiResult.keywords];
            for (const kw of existing) {
              if (!seen.has(kw)) {
                seen.add(kw);
                merged.push(kw);
              }
            }
            updateData.keywords = merged.slice(0, 10);
          }

          const { error: updateError } = await supabase
            .from("articles")
            .update(updateData)
            .eq("id", article.id);

          if (updateError) {
            stats.failed++;
            return;
          }
          stats.success++;
          if (isFallback) {
            backfillLog.fallback_used++;
          } else {
            backfillLog.success++;
          }
        })
      );

      for (const r of results) {
        if (r.status === "rejected") {
          stats.failed++;
        }
      }
    }

    console.log("[BACKFILL]", backfillLog);

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
