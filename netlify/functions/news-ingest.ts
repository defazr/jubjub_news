import { createClient } from "@supabase/supabase-js";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "";
const RAPIDAPI_HOST = "news-api14.p.rapidapi.com";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

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

export default async (req: Request) => {
  // Simple auth check — only allow scheduled or manual trigger with secret
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");
  const isScheduled = req.headers.get("x-netlify-event") === "schedule";

  if (!isScheduled && secret !== SUPABASE_SERVICE_KEY.slice(0, 16)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const stats = { fetched: 0, inserted: 0, duplicates: 0, errors: 0 };

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
    // Small delay between API calls
    await new Promise((r) => setTimeout(r, 300));
  }

  stats.fetched = allArticles.length;

  // 3. Get existing hashes to avoid duplicates
  const hashes = allArticles.map((a) => createSourceHash(a.article.url));
  const { data: existing } = await supabase
    .from("articles")
    .select("source_hash")
    .in("source_hash", hashes);

  const existingHashes = new Set((existing || []).map((e) => e.source_hash));

  // 4. Insert new articles
  const toInsert = [];
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

    // Ensure unique slug within this batch
    if (seenSlugs.has(slug)) {
      slug = `${slug}-${hash.slice(0, 4)}`;
    }
    seenSlugs.add(slug);

    const keywords = extractKeywords(article.title, article.excerpt || "");

    toInsert.push({
      title: sanitizeText(article.title),
      slug,
      excerpt: article.excerpt ? sanitizeText(article.excerpt) : null,
      source_url: article.url,
      image_url: article.thumbnail || null,
      publisher: article.publisher?.name || null,
      category,
      keywords,
      published_at: article.date || null,
      source_hash: hash,
    });

    existingHashes.add(hash); // prevent within-batch duplicates
  }

  // 5. Batch insert (Supabase supports upsert)
  if (toInsert.length > 0) {
    // Insert in chunks of 50
    for (let i = 0; i < toInsert.length; i += 50) {
      const chunk = toInsert.slice(i, i + 50);
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

  return new Response(
    JSON.stringify({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
};

// Netlify Scheduled Function config
export const config = {
  schedule: "0 */4 * * *", // Every 4 hours
};
