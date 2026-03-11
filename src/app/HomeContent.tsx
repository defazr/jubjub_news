"use client";

import { useState } from "react";
import Header from "@/components/Header";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import HeadlineSection from "@/components/HeadlineSection";
import CategorySection from "@/components/CategorySection";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import ReadingProgress from "@/components/ReadingProgress";
import AdUnit from "@/components/AdUnit";
import TranslateButton from "@/components/TranslateButton";
import { translateTexts, type ApiArticle } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap } from "lucide-react";
import TrendingTopics from "@/components/TrendingTopics";

function InlineAd({ slot, className = "" }: { slot: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-[10px] text-muted-foreground/50 text-center mb-1">Ad</p>
      <AdUnit slot={slot} />
    </div>
  );
}

interface Props {
  trending: ApiArticle[];
  categoryData: Record<string, ApiArticle[]>;
  aiArticles: ApiArticle[];
  popularKeywords: string[];
}

export default function HomeContent({ trending, categoryData, aiArticles, popularKeywords }: Props) {
  const [currentTrending, setCurrentTrending] = useState(trending);
  const [currentCategories, setCurrentCategories] = useState(categoryData);
  const [translated, setTranslated] = useState(false);
  const [translating, setTranslating] = useState(false);

  async function handleTranslate() {
    if (translating) return;

    if (translated) {
      setCurrentTrending(trending);
      setCurrentCategories(categoryData);
      setTranslated(false);
      return;
    }

    setTranslating(true);

    // Translate trending headlines
    const trendingTexts = currentTrending.slice(0, 10).flatMap((a) => [a.title, a.excerpt]);
    const trendingResult = await translateTexts(trendingTexts, "ko");
    const updatedTrending = currentTrending.map((a, i) => {
      if (i >= 10) return a;
      return {
        ...a,
        title: trendingResult[i * 2] || a.title,
        excerpt: trendingResult[i * 2 + 1] || a.excerpt,
      };
    });
    setCurrentTrending(updatedTrending);

    // Translate category articles in parallel
    const catEntries = Object.entries(currentCategories);
    const catResults = await Promise.all(
      catEntries.map(async ([cat, articles]) => {
        const catTexts = articles.flatMap((a) => [a.title, a.excerpt]);
        const catResult = await translateTexts(catTexts, "ko");
        return [cat, articles.map((a, i) => ({
          ...a,
          title: catResult[i * 2] || a.title,
          excerpt: catResult[i * 2 + 1] || a.excerpt,
        }))] as [string, ApiArticle[]];
      })
    );
    setCurrentCategories(Object.fromEntries(catResults));

    setTranslated(true);
    setTranslating(false);
  }

  const headlines = currentTrending.slice(0, 5);
  const breakingTitles = currentTrending.slice(0, 4).map((a) => a.title);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <BreakingNewsTicker items={breakingTitles} />

      <main className="max-w-[1200px] mx-auto px-3 md:px-4 py-5 md:py-8">
        {/* Translate button */}
        <div className="flex justify-end mb-4">
          <TranslateButton
            translated={translated}
            translating={translating}
            targetLabel="한국어 번역"
            onToggle={handleTranslate}
          />
        </div>

        <HeadlineSection articles={headlines} />

        {/* Breaking — Latest global headlines updated by AI */}
        {currentTrending.length > 0 && (
          <section className="mb-6 md:mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-5 w-5 text-red-500 fill-red-500" />
              <h2 className="text-lg font-bold">Breaking</h2>
              <span className="text-xs text-muted-foreground">Latest global headlines updated by AI</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {currentTrending.slice(0, 5).map((article, i) => (
                <a
                  key={`breaking-${i}`}
                  href={article.url}
                  className="group block p-3 rounded-lg border border-red-500/20 hover:border-red-500/50 hover:bg-red-500/5 transition-all"
                >
                  {article.thumbnail && (
                    <div className="aspect-video rounded overflow-hidden mb-2">
                      <img
                        src={article.thumbnail}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                  <h3 className="text-sm font-semibold line-clamp-2 leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">
                    {article.publisher.name}
                  </p>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* AI 요약 뉴스 섹션 */}
        {aiArticles.length > 0 && (
          <section className="mb-6 md:mb-8">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Summary
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {aiArticles.slice(0, 5).map((article, i) => (
                <a
                  key={i}
                  href={article.url}
                  className="block p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-accent/50 transition-all"
                >
                  <Badge variant="outline" className="text-[10px] mb-1.5 text-primary border-primary/30">AI Summary</Badge>
                  <h3 className="text-sm font-semibold line-clamp-2 text-card-foreground leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{article.excerpt}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1.5">
                    {article.publisher.name}
                  </p>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Trending Topics */}
        <TrendingTopics keywords={popularKeywords} className="mb-6" />

        {/* Ad: top-home */}
        <InlineAd slot="top-home" className="my-5" />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <CategorySection
              categoryData={currentCategories}
              renderMidAd={
                <InlineAd slot="bottom-home" className="my-5" />
              }
            />
          </div>
          <div className="lg:col-span-1">
            <Sidebar articles={currentTrending.slice(0, 10)} />
          </div>
        </div>
      </main>

      <Footer />
      <ScrollToTop />
      <ReadingProgress />
    </div>
  );
}
