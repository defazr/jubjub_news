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
import { filterArticles } from "@/lib/contentFilter";
import HomeContent from "./HomeContent";

export const revalidate = 900; // ISR: revalidate every 15 minutes (reduced writes)

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
  const trending = filterArticles(effectiveTrending).map(articleToApiArticle);
  const aiArticles = filterArticles(aiRaw, { excludeFailedSummary: true }).map(articleToApiArticle);
  const breaking = filterArticles(breakingRaw).map(articleToApiArticle);

  const categoryData: Record<string, ReturnType<typeof articleToApiArticle>[]> = {};
  HOMEPAGE_CATEGORIES.forEach((c, i) => {
    categoryData[c.label] = filterArticles(categoryResults[i]).map(articleToApiArticle);
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
