import { supabase } from "./supabase";
import type { Article } from "@/types/database";

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
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .single();
  return data;
}

export async function getLatestArticles(limit: number = 20): Promise<Article[]> {
  const { data } = await supabase
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data || [];
}

export async function getArticlesByCategory(
  category: string,
  limit: number = 20
): Promise<Article[]> {
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("category", category)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data || [];
}

export async function getArticlesByKeyword(
  keyword: string,
  limit: number = 20
): Promise<Article[]> {
  const { data } = await supabase
    .from("articles")
    .select("*")
    .contains("keywords", [keyword])
    .order("created_at", { ascending: false })
    .limit(limit);
  return data || [];
}

export async function getRelatedArticles(
  article: Article,
  limit: number = 5
): Promise<Article[]> {
  // Find articles with overlapping keywords, excluding current article
  const { data } = await supabase
    .from("articles")
    .select("*")
    .neq("id", article.id)
    .eq("category", article.category)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data || [];
}

export async function getPopularKeywords(limit: number = 20): Promise<string[]> {
  const { data } = await supabase
    .from("articles")
    .select("keywords")
    .order("created_at", { ascending: false })
    .limit(200);

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
  const { data } = await supabase
    .from("articles")
    .select("*")
    .not("summary", "is", null)
    .neq("summary", "")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data || [];
}

export async function getTrendingArticles(limit: number = 10): Promise<Article[]> {
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("category", "trending")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data || [];
}
