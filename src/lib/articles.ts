import { supabase } from "./supabase";
import type { Article } from "@/types/database";

// Always use anon client — RLS allows public reads
function getClient() {
  return supabase;
}

/** Parse summary field — supports 3 formats:
 *  1. OLD: "SEO_HEADLINE: ...\nSUMMARY: ..."
 *  2. NEW: "headline\n\nsummary text..."
 *  3. LEGACY: plain summary text (no headline)
 */
export function parseSummary(summary: string | null): { seoHeadline: string | null; summaryText: string | null } {
  if (!summary) return { seoHeadline: null, summaryText: null };

  // Format 1: OLD labeled format
  const headlineMatch = summary.match(/^SEO_HEADLINE:\s*(.+)/m);
  const summaryMatch = summary.match(/^SUMMARY:\s*(.+)/m);
  if (headlineMatch && summaryMatch) {
    return {
      seoHeadline: headlineMatch[1].trim(),
      summaryText: summaryMatch[1].trim(),
    };
  }

  // Format 2: NEW newline-based format (first line = headline, blank line, rest = summary)
  const parts = summary.split(/\n\s*\n/);
  if (parts.length >= 2) {
    const firstLine = parts[0].trim();
    const rest = parts.slice(1).join("\n\n").trim();
    // Headline should be short (< 100 chars) and not look like a full paragraph
    if (firstLine.length > 0 && firstLine.length < 100 && rest.length > 0) {
      return {
        seoHeadline: firstLine,
        summaryText: rest,
      };
    }
  }

  // Format 3: LEGACY plain summary
  return { seoHeadline: null, summaryText: summary };
}

const FALLBACK_IMAGE = "https://headlines.fazr.co.kr/Headlines_Fazr_OG_image.png";

/** Remove duplicate articles by source_url, keeping the first (newest) occurrence */
function dedup(articles: Article[]): Article[] {
  const seen = new Set<string>();
  return articles.filter((a) => {
    if (seen.has(a.source_url)) return false;
    seen.add(a.source_url);
    return true;
  });
}

/** Convert a DB Article to the ApiArticle shape used by UI components */
export function articleToApiArticle(article: Article) {
  return {
    title: article.title,
    url: `/news/${article.slug}`,
    excerpt: article.excerpt || "",
    thumbnail: article.image_url || FALLBACK_IMAGE,
    language: "en",
    date: article.published_at || article.created_at,
    authors: [] as string[],
    publisher: {
      name: article.publisher || "",
      url: "",
      favicon: "",
    },
  };
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const { data, error } = await getClient()
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) console.error("[articles] getArticleBySlug error:", error.message);
  return data;
}

export async function getLatestArticles(limit: number = 20): Promise<Article[]> {
  const { data, error } = await getClient()
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) console.error("[articles] getLatestArticles error:", error.message);
  return dedup(data || []);
}

export async function getArticlesByCategory(
  category: string,
  limit: number = 20
): Promise<Article[]> {
  const { data, error } = await getClient()
    .from("articles")
    .select("*")
    .eq("category", category)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) console.error("[articles] getArticlesByCategory error:", error.message, category);
  return dedup(data || []);
}

export async function getArticlesByKeyword(
  keyword: string,
  limit: number = 20
): Promise<Article[]> {
  const { data, error } = await getClient()
    .from("articles")
    .select("*")
    .or(`keywords.cs.{${keyword}},title.ilike.%${keyword}%`)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) console.error("[articles] getArticlesByKeyword error:", error.message, keyword);
  return dedup(data || []);
}

export async function getRelatedArticles(
  article: Article,
  limit: number = 5
): Promise<Article[]> {
  const { data, error } = await getClient()
    .from("articles")
    .select("*")
    .neq("id", article.id)
    .eq("category", article.category)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) console.error("[articles] getRelatedArticles error:", error.message);
  return dedup(data || []);
}

export async function getPopularKeywords(limit: number = 20): Promise<string[]> {
  const { data, error } = await getClient()
    .from("articles")
    .select("keywords")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) console.error("[articles] getPopularKeywords error:", error.message);
  if (!data) return [];

  const freq = new Map<string, number>();
  for (const row of data as { keywords: string[] }[]) {
    for (const kw of row.keywords || []) {
      freq.set(kw, (freq.get(kw) || 0) + 1);
    }
  }

  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([kw]) => kw);
}

export async function getArticlesWithSummary(limit: number = 30): Promise<Article[]> {
  const { data, error } = await getClient()
    .from("articles")
    .select("*")
    .not("summary", "is", null)
    .neq("summary", "")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) console.error("[articles] getArticlesWithSummary error:", error.message);
  return dedup(data || []);
}

export async function getTrendingArticles(limit: number = 10): Promise<Article[]> {
  const { data, error } = await getClient()
    .from("articles")
    .select("*")
    .eq("category", "trending")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) console.error("[articles] getTrendingArticles error:", error.message);
  return dedup(data || []);
}

/** Get popular keywords grouped by category */
export async function getKeywordsByCategory(categories: string[], limit: number = 10): Promise<Record<string, string[]>> {
  const result: Record<string, string[]> = {};

  for (const cat of categories) {
    const { data, error } = await getClient()
      .from("articles")
      .select("keywords")
      .eq("category", cat)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("[articles] getKeywordsByCategory error:", error.message, cat);
      result[cat] = [];
      continue;
    }

    const freq = new Map<string, number>();
    for (const row of (data || []) as { keywords: string[] }[]) {
      for (const kw of row.keywords || []) {
        freq.set(kw, (freq.get(kw) || 0) + 1);
      }
    }

    result[cat] = [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([kw]) => kw);
  }

  return result;
}
