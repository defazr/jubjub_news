import { getArticlesByCategory, articleToApiArticle } from "@/lib/articles";
import { getCategoryBySlug } from "@/lib/categories";
import CategoryPageContent from "@/components/CategoryPage";

export const revalidate = 1800; // ISR: 30 minutes (reduced writes)

const category = getCategoryBySlug("economy")!;

export default async function Page() {
  const articles = await getArticlesByCategory(category.dbCategory || "business", 20);
  const apiArticles = articles.map(articleToApiArticle);
  return <CategoryPageContent category={category} initialArticles={apiArticles} />;
}
