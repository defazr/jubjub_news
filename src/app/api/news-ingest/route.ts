import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { shouldSkipArticle } from "@/lib/articleFilter";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "";
const RAPIDAPI_HOST = "news-api14.p.rapidapi.com";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";
const INGEST_SECRET = process.env.INGEST_SECRET || "";

const CATEGORIES = [
  { name: "technology", query: "technology" },
  { name: "business", query: "business" },
  { name: "science", query: "science" },
  { name: "world", query: "world" },
  { name: "sports", query: "sports" },
  { name: "health", query: "health" },
  { name: "entertainment", query: "entertainment" },
  { name: "ai", query: "artificial intelligence AI" },
];

interface RawArticle {
  title: string;
  url: string;
  excerpt?: string;
  thumbnail?: string;
  date: string;
  publisher?: { name?: string };
}

function sanitizeText(text: string): string {
  return text
    .replace(/[\uFFFD\uFFFE\uFFFF]/g, "")
    .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/g, "")
    .replace(/(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, "");
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function createSourceHash(url: string): string {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = ((hash << 5) - hash) + url.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function extractKeywords(title: string, excerpt: string): string[] {
  const text = `${title} ${excerpt}`.toLowerCase();
  const stopWords = new Set([
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "shall", "can", "need", "dare", "ought",
    "used", "to", "of", "in", "for", "on", "with", "at", "by", "from",
    "as", "into", "through", "during", "before", "after", "above", "below",
    "between", "out", "off", "over", "under", "again", "further", "then",
    "once", "and", "but", "or", "nor", "not", "so", "yet", "both", "either",
    "neither", "each", "every", "all", "any", "few", "more", "most", "other",
    "some", "such", "no", "only", "own", "same", "than", "too", "very",
    "just", "because", "about", "this", "that", "these", "those", "it",
    "its", "he", "she", "they", "them", "his", "her", "their", "what",
    "which", "who", "whom", "how", "when", "where", "why", "new", "says",
    "said", "also", "like", "get", "make", "know",
  ]);

  const words = text.replace(/[^a-z0-9\s]/g, "").split(/\s+/);
  const freq = new Map<string, number>();

  for (const w of words) {
    if (w.length >= 3 && !stopWords.has(w)) {
      freq.set(w, (freq.get(w) || 0) + 1);
    }
  }

  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
}

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

async function generateSummaryAndKeywords(title: string, excerpt: string | null): Promise<AiResult> {
  if (!ANTHROPIC_API_KEY) return { summary: null, keywords: null };

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

    if (!res.ok) return { summary: generateFallbackSummary(title), keywords: null };

    const data = await res.json();
    const text = data.content?.[0]?.text;
    if (!text) return { summary: generateFallbackSummary(title), keywords: null };

    // Reject failed/refused summaries
    if (isFailedSummary(text)) return { summary: generateFallbackSummary(title), keywords: null };

    // Extract keywords from last line if present
    const keywordsMatch = text.match(/^KEYWORDS:\s*(.+)$/m);
    let aiKeywords: string[] | null = null;
    let summaryText = text;

    if (keywordsMatch) {
      aiKeywords = keywordsMatch[1]
        .split(",")
        .map((k: string) => k.trim().toLowerCase())
        .filter((k: string) => k.length >= 2 && k.length <= 30);
      // Remove the KEYWORDS line from summary
      summaryText = text.replace(/\n*^KEYWORDS:.*$/m, "").trim();
    }

    // Reject poor quality summaries with meta-commentary
    if (isPoorQualitySummary(summaryText)) {
      return { summary: generateFallbackSummary(title), keywords: aiKeywords };
    }

    return { summary: summaryText, keywords: aiKeywords };
  } catch {
    return { summary: generateFallbackSummary(title), keywords: null };
  }
}

async function fetchTrending(language: string = "en"): Promise<RawArticle[]> {
  const url = `https://${RAPIDAPI_HOST}/v2/trendings?topic=General&language=${language}`;
  try {
    const res = await fetch(url, {
      headers: {
        "x-rapidapi-host": RAPIDAPI_HOST,
        "x-rapidapi-key": RAPIDAPI_KEY,
      },
    });
    const raw = sanitizeText(await res.text());
    const data = JSON.parse(raw);
    return data.data || [];
  } catch {
    return [];
  }
}

async function fetchByCategory(query: string, language: string = "en"): Promise<RawArticle[]> {
  const url = `https://${RAPIDAPI_HOST}/v2/search/articles?query=${encodeURIComponent(query)}&language=${language}`;
  try {
    const res = await fetch(url, {
      headers: {
        "x-rapidapi-host": RAPIDAPI_HOST,
        "x-rapidapi-key": RAPIDAPI_KEY,
      },
    });
    const raw = sanitizeText(await res.text());
    const data = JSON.parse(raw);
    return data.data || [];
  } catch {
    return [];
  }
}

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  try {
    // Debug mode - check config without auth (placed first for diagnostics)
    const action = req.nextUrl.searchParams.get("action");
    if (action === "status") {
      return NextResponse.json({
        hasSupabaseUrl: !!SUPABASE_URL,
        hasSupabaseKey: !!SUPABASE_SERVICE_KEY,
        hasRapidApiKey: !!RAPIDAPI_KEY,
        hasAnthropicKey: !!ANTHROPIC_API_KEY,
        supabaseUrl: SUPABASE_URL ? SUPABASE_URL.slice(0, 30) + "..." : "NOT SET",
        serviceKeyPrefix: SUPABASE_SERVICE_KEY ? SUPABASE_SERVICE_KEY.slice(0, 10) + "..." : "NOT SET",
      });
    }

    // Test mode - test each service individually
    if (action === "test") {
      const results: Record<string, unknown> = {};

      // Test Supabase connection
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
        const { data, error } = await supabase.from("articles").select("id").limit(1);
        results.supabase = error ? { error: error.message, code: error.code } : { ok: true, rows: data?.length ?? 0 };
      } catch (e) {
        results.supabase = { error: e instanceof Error ? e.message : String(e) };
      }

      // Test RapidAPI
      try {
        const res = await fetch(`https://${RAPIDAPI_HOST}/v2/trendings?topic=General&language=en`, {
          headers: { "x-rapidapi-host": RAPIDAPI_HOST, "x-rapidapi-key": RAPIDAPI_KEY },
        });
        const text = await res.text();
        results.rapidapi = { status: res.status, bodyLength: text.length, preview: text.slice(0, 100) };
      } catch (e) {
        results.rapidapi = { error: e instanceof Error ? e.message : String(e) };
      }

      // Test Anthropic
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
            max_tokens: 20,
            messages: [{ role: "user", content: "Say hello in one word." }],
          }),
        });
        const data = await res.json();
        results.anthropic = { status: res.status, response: data.content?.[0]?.text || data.error || data };
      } catch (e) {
        results.anthropic = { error: e instanceof Error ? e.message : String(e) };
      }

      return NextResponse.json(results);
    }

    // Validate required environment variables
    console.log("[INGEST] env check:", {
      SUPABASE_URL: !!SUPABASE_URL,
      SUPABASE_SERVICE_KEY: !!SUPABASE_SERVICE_KEY,
      RAPIDAPI_KEY: !!RAPIDAPI_KEY,
      ANTHROPIC_API_KEY: !!ANTHROPIC_API_KEY,
      INGEST_SECRET: !!INGEST_SECRET,
      HAS_SERVICE_ROLE: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    });
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return NextResponse.json(
        { error: "Server misconfiguration: missing Supabase environment variables" },
        { status: 500 }
      );
    }

    if (!RAPIDAPI_KEY) {
      return NextResponse.json(
        { error: "Server misconfiguration: missing RAPIDAPI_KEY" },
        { status: 500 }
      );
    }

    if (!INGEST_SECRET) {
      return NextResponse.json(
        { error: "Server misconfiguration: missing INGEST_SECRET" },
        { status: 500 }
      );
    }

    // Auth check using dedicated INGEST_SECRET
    const secret = req.nextUrl.searchParams.get("secret");
    if (!secret || secret !== INGEST_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized", hint: "Missing or invalid secret parameter" },
        { status: 401 }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const stats = { fetched: 0, inserted: 0, duplicates: 0, errors: 0, summaries: 0 };
    const timing: Record<string, number> = {};
    const t0 = Date.now();

    // 1. Fetch trending + all categories in parallel
    const fetchStart = Date.now();
    const [trending, ...categoryResults] = await Promise.all([
      fetchTrending("en"),
      ...CATEGORIES.map((cat) => fetchByCategory(cat.query, "en")),
    ]);
    timing.fetchMs = Date.now() - fetchStart;

    const allArticles: { article: RawArticle; category: string }[] =
      trending.map((a) => ({ article: a, category: "trending" }));

    // 2. Flatten category results
    categoryResults.forEach((articles, idx) => {
      for (const a of articles) {
        allArticles.push({ article: a, category: CATEGORIES[idx].name });
      }
    });

    stats.fetched = allArticles.length;

    // 3. Get existing hashes to avoid duplicates
    const hashes = allArticles.map((a) => createSourceHash(a.article.url));
    let existingHashes = new Set<string>();

    if (hashes.length > 0) {
      const { data: existing, error: hashError } = await supabase
        .from("articles")
        .select("source_hash")
        .in("source_hash", hashes);

      if (hashError) {
        console.error("Hash lookup error:", hashError);
      }
      existingHashes = new Set((existing || []).map((e) => e.source_hash));
    }

    // 4. Prepare new articles
    interface PreparedArticle {
      title: string;
      slug: string;
      summary: string | null;
      excerpt: string | null;
      source_url: string;
      image_url: string | null;
      publisher: string | null;
      category: string;
      keywords: string[];
      published_at: string | null;
      source_hash: string;
    }

    const prepared: PreparedArticle[] = [];
    const seenSlugs = new Set<string>();

    // --- spam / SEO page filter keywords ---
    const spamKeywords = [
      "tickets", "ticket", "archives", "archive", "hospitality",
      "betting", "casino", "tag page", "category page",
    ];

    for (const { article, category } of allArticles) {
      if (!article.title || !article.url) continue;

      // Junk article filter (cookie/paywall/login/bot/portal pages)
      if (shouldSkipArticle(article.title, article.excerpt)) continue;

      // Spam / SEO page filter
      const titleLower = article.title.toLowerCase();
      if (article.title.length > 120) continue;
      if (article.title.split(" ").length < 4) continue;
      if (spamKeywords.some((k) => titleLower.includes(k))) continue;
      if ((article.title.match(/\|/g) || []).length >= 3) continue;

      const hash = createSourceHash(article.url);
      if (existingHashes.has(hash)) {
        stats.duplicates++;
        continue;
      }

      let slug = generateSlug(article.title);
      if (!slug) continue;

      if (seenSlugs.has(slug)) {
        slug = `${slug}-${hash.slice(0, 4)}`;
      }
      seenSlugs.add(slug);

      const cleanTitle = sanitizeText(article.title);
      const cleanExcerpt = article.excerpt ? sanitizeText(article.excerpt) : null;
      const keywords = extractKeywords(cleanTitle, cleanExcerpt || "");

      prepared.push({
        title: cleanTitle,
        slug,
        summary: null,
        excerpt: cleanExcerpt,
        source_url: article.url,
        image_url: article.thumbnail || null,
        publisher: article.publisher?.name || null,
        category,
        keywords,
        published_at: article.date || null,
        source_hash: hash,
      });

      existingHashes.add(hash);
    }

    // 5. Generate AI summaries + keywords (only if ?summarize=true to avoid timeout)
    const shouldSummarize = req.nextUrl.searchParams.get("summarize") === "true";
    if (shouldSummarize) {
      const summaryStart = Date.now();
      const summaryLog = { success: 0, fallback_used: 0, failed_pattern: 0, failed_other: 0 };
      const summaryResults = await Promise.allSettled(
        prepared.map(async (item) => {
          const aiResult = await generateSummaryAndKeywords(item.title, item.excerpt ?? null);
          if (aiResult.summary) {
            const isFallback = aiResult.summary === generateFallbackSummary(item.title);
            item.summary = aiResult.summary;
            stats.summaries++;
            if (isFallback) {
              summaryLog.fallback_used++;
            } else {
              summaryLog.success++;
            }
          } else {
            // NULL 방지: fallback으로 채움
            item.summary = generateFallbackSummary(item.title);
            stats.summaries++;
            summaryLog.failed_other++;
          }
          if (aiResult.keywords && aiResult.keywords.length > 0) {
            const seen = new Set(aiResult.keywords);
            const merged = [...aiResult.keywords];
            for (const kw of item.keywords) {
              if (!seen.has(kw)) {
                seen.add(kw);
                merged.push(kw);
              }
            }
            item.keywords = merged.slice(0, 10);
          }
        })
      );
      for (const r of summaryResults) {
        if (r.status === "rejected") {
          console.error("Summary generation failed:", r.reason);
        }
      }
      timing.summaryMs = Date.now() - summaryStart;
      console.log("[SUMMARY]", summaryLog);
    }

    // 6. Batch insert (Supabase upsert)
    const insertStart = Date.now();
    if (prepared.length > 0) {
      for (let i = 0; i < prepared.length; i += 50) {
        const chunk = prepared.slice(i, i + 50);
        const { error } = await supabase
          .from("articles")
          .upsert(chunk, { onConflict: "slug", ignoreDuplicates: true });

        if (error) {
          console.error("Insert error:", error);
          stats.errors++;
        } else {
          stats.inserted += chunk.length;
        }
      }
    }
    timing.insertMs = Date.now() - insertStart;
    timing.totalMs = Date.now() - t0;

    console.log("[INGEST]", { ...stats, timing });

    return NextResponse.json({
      success: true,
      stats,
      timing,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("news-ingest unhandled error:", err);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
