import {
  getTrendingArticles,
  getArticlesByCategory,
  getArticlesWithSummary,
  getPopularKeywords,
  articleToApiArticle,
} from "@/lib/articles";
import { HOMEPAGE_CATEGORIES } from "@/lib/categories";
import HomeContent from "./HomeContent";

export const revalidate = 300; // ISR: revalidate every 5 minutes

export default async function Home() {
  const [trendingRaw, aiRaw, popularKeywords, ...categoryResults] = await Promise.all([
    getTrendingArticles(15),
    getArticlesWithSummary(10),
    getPopularKeywords(15),
    ...HOMEPAGE_CATEGORIES.map((c) => getArticlesByCategory(c.db, 5)),
  ]);

  const trending = trendingRaw.map(articleToApiArticle);
  const aiArticles = aiRaw.map(articleToApiArticle);

  const categoryData: Record<string, ReturnType<typeof articleToApiArticle>[]> = {};
  HOMEPAGE_CATEGORIES.forEach((c, i) => {
    categoryData[c.label] = categoryResults[i].map(articleToApiArticle);
  });

  return (
    <HomeContent
      trending={trending}
      categoryData={categoryData}
      aiArticles={aiArticles}
      popularKeywords={popularKeywords}
    />
  );
}
