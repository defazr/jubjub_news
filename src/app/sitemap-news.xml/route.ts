import { supabase } from "@/lib/supabase";

const SITE_URL = "https://headlines.fazr.co.kr";

export const revalidate = 3600; // Revalidate hourly

export async function GET() {
  const { data } = await supabase
    .from("articles")
    .select("slug, created_at")
    .order("created_at", { ascending: false })
    .limit(5000);

  const articles = (data || []) as { slug: string; created_at: string }[];

  const urls = articles
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
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
    },
  });
}
