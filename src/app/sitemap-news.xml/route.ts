import { supabase } from "@/lib/supabase";

const SITE_URL = "https://headlines.fazr.co.kr";

export const revalidate = 3600; // Revalidate hourly

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  // Google News sitemap: only articles from last 48 hours
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  const { data: recentData } = await supabase
    .from("articles")
    .select("slug, title, created_at, published_at")
    .gte("created_at", twoDaysAgo)
    .order("created_at", { ascending: false })
    .limit(1000);

  const recentArticles = (recentData || []) as {
    slug: string;
    title: string;
    created_at: string;
    published_at: string | null;
  }[];

  // Also fetch older articles for standard sitemap entries
  const { data: olderData } = await supabase
    .from("articles")
    .select("slug, created_at")
    .lt("created_at", twoDaysAgo)
    .order("created_at", { ascending: false })
    .limit(5000);

  const olderArticles = (olderData || []) as {
    slug: string;
    created_at: string;
  }[];

  // Recent articles with Google News <news:news> tags
  const recentUrls = recentArticles
    .map(
      (a) => `  <url>
    <loc>${SITE_URL}/news/${a.slug}</loc>
    <lastmod>${new Date(a.published_at || a.created_at).toISOString()}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
    <news:news>
      <news:publication>
        <news:name>Headlines Fazr</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${new Date(a.published_at || a.created_at).toISOString()}</news:publication_date>
      <news:title>${escapeXml(a.title)}</news:title>
    </news:news>
  </url>`
    )
    .join("\n");

  // Older articles: standard sitemap entries
  const olderUrls = olderArticles
    .map(
      (a) => `  <url>
    <loc>${SITE_URL}/news/${a.slug}</loc>
    <lastmod>${new Date(a.created_at).toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join("\n");

  // Static pages
  const staticPages = [
    { loc: "/", priority: "1.0", freq: "hourly" },
    { loc: "/ai", priority: "0.8", freq: "hourly" },
    { loc: "/world", priority: "0.7", freq: "hourly" },
    { loc: "/trending", priority: "0.8", freq: "hourly" },
    { loc: "/digest", priority: "0.8", freq: "daily" },
    { loc: "/search", priority: "0.5", freq: "daily" },
    { loc: "/category/politics", priority: "0.8", freq: "hourly" },
    { loc: "/category/economy", priority: "0.8", freq: "hourly" },
    { loc: "/category/society", priority: "0.8", freq: "hourly" },
    { loc: "/category/world", priority: "0.8", freq: "hourly" },
    { loc: "/category/culture", priority: "0.8", freq: "hourly" },
    { loc: "/category/tech", priority: "0.8", freq: "hourly" },
    { loc: "/category/sports", priority: "0.8", freq: "hourly" },
    { loc: "/category/opinion", priority: "0.8", freq: "hourly" },
  ];

  const staticUrls = staticPages
    .map(
      (p) => `  <url>
    <loc>${SITE_URL}${p.loc}</loc>
    <changefreq>${p.freq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${staticUrls}
${recentUrls}
${olderUrls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
    },
  });
}
