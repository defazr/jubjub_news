import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArticleBySlug, getRelatedArticles, getPopularKeywords, parseSummary } from "@/lib/articles";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdUnit from "@/components/AdUnit";
import TrendingTopics from "@/components/TrendingTopics";
import ArticleContent from "./ArticleContent";

export const revalidate = 3600; // ISR: 1 hour

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "기사를 찾을 수 없습니다" };

  const { summaryText } = parseSummary(article.summary);
  const description = summaryText || article.excerpt || "";
  const ogImage = article.image_url || "https://headlines.fazr.co.kr/Headlines_Fazr_OG_image.png";

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

  const [relatedArticles, popularKeywords] = await Promise.all([
    getRelatedArticles(article, 6),
    getPopularKeywords(15),
  ]);

  // JSON-LD structured data for Google News / Discover
  const { summaryText: parsedSummary } = parseSummary(article.summary);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    image: article.image_url
      ? [{ "@type": "ImageObject", url: article.image_url, width: 1200, height: 675 }]
      : [],
    datePublished: article.published_at || article.created_at,
    dateModified: article.created_at,
    description: parsedSummary || article.excerpt || "",
    author: {
      "@type": "Organization",
      name: "Headlines Fazr",
      url: "https://headlines.fazr.co.kr",
    },
    publisher: {
      "@type": "Organization",
      name: "Headlines Fazr",
      url: "https://headlines.fazr.co.kr",
      logo: {
        "@type": "ImageObject",
        url: "https://headlines.fazr.co.kr/logo.png",
        width: 512,
        height: 512,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://headlines.fazr.co.kr/news/${slug}`,
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="max-w-[800px] mx-auto px-4 py-6">
        {/* Top Ad */}
        <AdUnit slot="top-article" className="mb-6" />

        <ArticleContent article={article} relatedArticles={relatedArticles} />

        {/* Trending Topics */}
        <TrendingTopics keywords={popularKeywords} className="mt-6" />

        {/* Bottom Ad */}
        <AdUnit slot="bottom-article" className="mt-6" />
      </main>
      <Footer />
    </div>
  );
}
