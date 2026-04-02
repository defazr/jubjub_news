import { getPopularKeywords } from "@/lib/articles";
import { supabase } from "@/lib/supabase";

const SITE_URL = "https://headlines.fazr.co.kr";

// Core SEO keywords — included in sitemap only if they have articles
const CORE_KEYWORDS = [
  "ai", "chatgpt", "openai", "nvidia", "apple", "tesla", "microsoft",
  "google", "meta", "amazon", "bitcoin", "crypto", "startup",
  "semiconductor", "iphone", "android", "robot", "space", "quantum", "gpu",
  "gpt5", "gemini", "copilot", "deepseek", "anthropic", "samsung",
  "economy", "climate", "cybersecurity", "5g", "ev", "cloud", "chip",
];

export const revalidate = 3600; // Revalidate hourly

/** Check which CORE_KEYWORDS have at least 1 article (keywords column or title match) */
async function getCoreKeywordsWithArticles(): Promise<string[]> {
  const { data, error } = await supabase
    .from("articles")
    .select("keywords")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error || !data) return [];

  const dbKeywordSet = new Set<string>();
  for (const row of data as { keywords: string[] }[]) {
    for (const kw of row.keywords || []) {
      dbKeywordSet.add(kw.toLowerCase());
    }
  }

  return CORE_KEYWORDS.filter((kw) => dbKeywordSet.has(kw.toLowerCase()));
}

export async function GET() {
  const [dbKeywords, validCoreKeywords] = await Promise.all([
    getPopularKeywords(200),
    getCoreKeywordsWithArticles(),
  ]);

  // Merge: DB keywords + validated core keywords (deduplicated, case-insensitive)
  const seen = new Set<string>();
  const allKeywords: string[] = [];
  for (const kw of [...dbKeywords, ...validCoreKeywords]) {
    const lower = kw.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      allKeywords.push(kw);
    }
  }

  const urls = allKeywords
    .map(
      (kw) => `  <url>
    <loc>${SITE_URL}/topic/${encodeURIComponent(kw)}</loc>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
    },
  });
}
