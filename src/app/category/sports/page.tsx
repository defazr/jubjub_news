import { getArticlesByCategory, articleToApiArticle } from "@/lib/articles";
import { getCategoryBySlug } from "@/lib/categories";
import { filterArticles } from "@/lib/contentFilter";
import CategoryPageContent from "@/components/CategoryPage";

export const revalidate = 1800; // ISR: 30 minutes (reduced writes)

const category = getCategoryBySlug("sports")!;

export default async function Page() {
  const raw = await getArticlesByCategory(category.dbCategory || "sports", 20);
  const apiArticles = filterArticles(raw).map(articleToApiArticle);
  return <CategoryPageContent category={category} initialArticles={apiArticles} />;
}
