import { getPopularKeywords } from "@/lib/articles";

const SITE_URL = "https://headlines.fazr.co.kr";

export const revalidate = 3600; // Revalidate hourly

export async function GET() {
  const keywords = await getPopularKeywords(200);

  const urls = keywords
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
