import { supabase } from "./supabase";
import type { Article } from "@/types/database";

// Always use anon client — RLS allows public reads
function getClient() {
  return supabase;
}

/** Parse summary field that may contain SEO_HEADLINE and SUMMARY */
export function parseSummary(summary: string | null): { seoHeadline: string | null; summaryText: string | null } {
  if (!summary) return { seoHeadline: null, summaryText: null };

  const headlineMatch = summary.match(/^SEO_HEADLINE:\s*(.+)/m);
  const summaryMatch = summary.match(/^SUMMARY:\s*(.+)/m);

  if (headlineMatch && summaryMatch) {
    return {
      seoHeadline: headlineMatch[1].trim(),
      summaryText: summaryMatch[1].trim(),
    };
  }

  // Fallback: old format without SEO_HEADLINE
  return { seoHeadline: null, summaryText: summary };
}

/** Convert a DB Article to the ApiArticle shape used by UI components */
export function articleToApiArticle(article: Article) {
  return {
    title: article.title,
    url: `/news/${article.slug}`,
    excerpt: article.excerpt || "",
    thumbnail: article.image_url || "",
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
  return data || [];
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
  return data || [];
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
  return data || [];
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
  return data || [];
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
  return data || [];
}

export async function getTrendingArticles(limit: number = 10): Promise<Article[]> {
  const { data, error } = await getClient()
    .from("articles")
    .select("*")
    .eq("category", "trending")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) console.error("[articles] getTrendingArticles error:", error.message);
  return data || [];
}
