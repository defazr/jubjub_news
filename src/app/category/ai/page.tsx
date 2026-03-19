import { getArticlesByCategory, articleToApiArticle } from "@/lib/articles";
import { getCategoryBySlug } from "@/lib/categories";
import CategoryPageContent from "@/components/CategoryPage";

export const revalidate = 300;

const category = getCategoryBySlug("ai")!;

export default async function Page() {
  const articles = await getArticlesByCategory(category.dbCategory || "ai", 20);
  const apiArticles = articles.map(articleToApiArticle);
  return <CategoryPageContent category={category} initialArticles={apiArticles} />;
}
