import type { Metadata } from "next";
import { getArticlesWithSummary, getPopularKeywords } from "@/lib/articles";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdUnit from "@/components/AdUnit";
import AiArticleList from "./AiArticleList";

export const metadata: Metadata = {
  title: "AI 뉴스 요약 | JubJub 뉴스",
  description:
    "AI가 요약한 최신 뉴스를 한눈에 확인하세요. Claude AI가 주요 기사를 간결하게 정리해드립니다.",
  alternates: {
    canonical: "https://headlines.fazr.co.kr/ai",
  },
};

export default async function AiPage() {
  const [articles, keywords] = await Promise.all([
    getArticlesWithSummary(30),
    getPopularKeywords(15),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">AI 뉴스 요약</h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI가 주요 뉴스를 간결하게 요약했습니다 · {articles.length}개의 기사
          </p>
        </div>

        <AdUnit slot="top-ai" className="mb-6" />

        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {keywords.map((kw) => (
              <a
                key={kw}
                href={`/topic/${encodeURIComponent(kw)}`}
                className="px-3 py-1 rounded-full text-xs bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
              >
                #{kw}
              </a>
            ))}
          </div>
        )}

        <AiArticleList articles={articles} />

        <AdUnit slot="bottom-ai" className="mt-6" />
      </main>
      <Footer />
    </div>
  );
}
