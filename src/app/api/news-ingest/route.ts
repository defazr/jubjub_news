import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "";
const RAPIDAPI_HOST = "news-api14.p.rapidapi.com";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";

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
  excerpt: string;
  thumbnail: string;
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

function chunks<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
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

    // Auth check
    const secret = req.nextUrl.searchParams.get("secret");
    const expectedSecret = SUPABASE_SERVICE_KEY.slice(0, 16);
    if (!secret || secret !== expectedSecret) {
      return NextResponse.json(
        { error: "Unauthorized", hint: "Missing or invalid secret parameter" },
        { status: 401 }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const stats = { fetched: 0, inserted: 0, duplicates: 0, errors: 0, summaries: 0 };

    // 1. Fetch trending articles
    const trending = await fetchTrending("en");
    const allArticles: { article: RawArticle; category: string }[] =
      trending.map((a) => ({ article: a, category: "trending" }));

    // 2. Fetch by category (with delay between calls to avoid rate limiting)
    for (const cat of CATEGORIES) {
      const articles = await fetchByCategory(cat.query, "en");
      for (const a of articles) {
        allArticles.push({ article: a, category: cat.name });
      }
      await new Promise((r) => setTimeout(r, 300));
    }

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

    for (const { article, category } of allArticles) {
      if (!article.title || !article.url) continue;

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

    // 5. Generate AI summaries in batches of 10
    const BATCH_SIZE = 10;
    for (const batch of chunks(prepared, BATCH_SIZE)) {
      const results = await Promise.allSettled(
        batch.map(async (item) => {
          if (!item.excerpt) return;
          const summary = await generateSummary(item.title, item.excerpt);
          if (summary) {
            item.summary = summary;
            stats.summaries++;
          }
        })
      );
      for (const r of results) {
        if (r.status === "rejected") {
          console.error("Summary generation failed:", r.reason);
        }
      }
    }

    // 6. Batch insert (Supabase upsert)
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

    return NextResponse.json({
      success: true,
      stats,
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
