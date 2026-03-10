import type { Metadata } from "next";
import { getArticlesByKeyword } from "@/lib/articles";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdUnit from "@/components/AdUnit";
import TopicArticleList from "./TopicArticleList";

interface Props {
  params: Promise<{ keyword: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { keyword } = await params;
  const decoded = decodeURIComponent(keyword);
  return {
    title: `${decoded} 관련 뉴스`,
    description: `${decoded} 관련 최신 뉴스 모음`,
    alternates: {
      canonical: `https://headlines.fazr.co.kr/topic/${keyword}`,
    },
  };
}

export default async function TopicPage({ params }: Props) {
  const { keyword } = await params;
  const decoded = decodeURIComponent(keyword);
  const articles = await getArticlesByKeyword(decoded, 30);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            <span className="text-primary">#{decoded}</span> 관련 뉴스
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {articles.length}개의 기사
          </p>
        </div>

        <AdUnit slot="top-topic" className="mb-6" />

        <TopicArticleList articles={articles} />

        <AdUnit slot="bottom-topic" className="mt-6" />
      </main>
      <Footer />
    </div>
  );
}
