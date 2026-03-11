import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArticleBySlug, getRelatedArticles } from "@/lib/articles";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdUnit from "@/components/AdUnit";
import ArticleContent from "./ArticleContent";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "기사를 찾을 수 없습니다" };

  const description = article.summary || article.excerpt || "";
  const ogImage = article.image_url || "https://headlines.fazr.co.kr/og-default.png";

  return {
    title: article.title,
    description: description.slice(0, 160),
    keywords: article.keywords,
    openGraph: {
      title: article.title,
      description: description.slice(0, 160),
      type: "article",
      images: [{ url: ogImage, width: 1200, height: 630 }],
      publishedTime: article.published_at || undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: description.slice(0, 160),
      images: [ogImage],
    },
    alternates: {
      canonical: `https://headlines.fazr.co.kr/news/${slug}`,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles(article, 5);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-[800px] mx-auto px-4 py-6">
        {/* Top Ad */}
        <AdUnit slot="top-article" className="mb-6" />

        <ArticleContent article={article} relatedArticles={relatedArticles} />

        {/* Bottom Ad */}
        <AdUnit slot="bottom-article" className="mt-6" />
      </main>
      <Footer />
    </div>
  );
}
