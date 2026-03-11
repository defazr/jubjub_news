import { getPopularKeywords } from "@/lib/articles";

const SITE_URL = "https://headlines.fazr.co.kr";

// Core SEO keywords — always included in sitemap
const CORE_KEYWORDS = [
  "ai", "chatgpt", "openai", "nvidia", "apple", "tesla", "microsoft",
  "google", "meta", "amazon", "bitcoin", "crypto", "startup",
  "semiconductor", "iphone", "android", "robot", "space", "quantum", "gpu",
  "gpt5", "gemini", "copilot", "deepseek", "anthropic", "samsung",
  "economy", "climate", "cybersecurity", "5g", "ev", "cloud",
];

export const revalidate = 3600; // Revalidate hourly

export async function GET() {
  const dbKeywords = await getPopularKeywords(200);

  // Merge: DB keywords + core keywords (deduplicated, case-insensitive)
  const seen = new Set<string>();
  const allKeywords: string[] = [];
  for (const kw of [...dbKeywords, ...CORE_KEYWORDS]) {
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
