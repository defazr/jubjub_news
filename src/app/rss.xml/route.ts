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
  const { data } = await supabase
    .from("articles")
    .select("slug, title, excerpt, summary, published_at, created_at, category")
    .order("created_at", { ascending: false })
    .limit(50);

  const articles = (data || []) as {
    slug: string;
    title: string;
    excerpt: string | null;
    summary: string | null;
    published_at: string | null;
    created_at: string;
    category: string;
  }[];

  const items = articles
    .map(
      (a) => `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${SITE_URL}/news/${a.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/news/${a.slug}</guid>
      <description>${escapeXml(a.summary || a.excerpt || "")}</description>
      <category>${escapeXml(a.category)}</category>
      <pubDate>${new Date(a.published_at || a.created_at).toUTCString()}</pubDate>
    </item>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Headlines Fazr</title>
    <link>${SITE_URL}</link>
    <description>Global news curated by AI. Discover trending topics, AI summaries, and the latest worldwide stories.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
    },
  });
}
