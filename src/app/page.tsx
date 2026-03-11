import {
  getTrendingArticles,
  getLatestArticles,
  getArticlesByCategory,
  getArticlesWithSummary,
  getBreakingArticles,
  getPopularKeywords,
  articleToApiArticle,
} from "@/lib/articles";
import { HOMEPAGE_CATEGORIES } from "@/lib/categories";
import HomeContent from "./HomeContent";

export const revalidate = 60; // ISR: revalidate every 1 minute

export default async function Home() {
  const [trendingRaw, latestRaw, aiRaw, breakingRaw, popularKeywords, ...categoryResults] = await Promise.all([
    getTrendingArticles(15),
    getLatestArticles(15),
    getArticlesWithSummary(10),
    getBreakingArticles(5),
    getPopularKeywords(15),
    ...HOMEPAGE_CATEGORIES.map((c) => getArticlesByCategory(c.db, 5)),
  ]);

  // Fallback: if no trending articles, use latest
  const effectiveTrending = trendingRaw.length > 0 ? trendingRaw : latestRaw;
  const trending = effectiveTrending.map(articleToApiArticle);
  const aiArticles = aiRaw.map(articleToApiArticle);
  const breaking = breakingRaw.map(articleToApiArticle);

  const categoryData: Record<string, ReturnType<typeof articleToApiArticle>[]> = {};
  HOMEPAGE_CATEGORIES.forEach((c, i) => {
    categoryData[c.label] = categoryResults[i].map(articleToApiArticle);
  });

  return (
    <HomeContent
      trending={trending}
      breaking={breaking}
      categoryData={categoryData}
      aiArticles={aiArticles}
      popularKeywords={popularKeywords}
    />
  );
}
