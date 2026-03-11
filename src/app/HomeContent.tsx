"use client";

import Header from "@/components/Header";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import HeadlineSection from "@/components/HeadlineSection";
import CategorySection from "@/components/CategorySection";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import ReadingProgress from "@/components/ReadingProgress";
import AdUnit from "@/components/AdUnit";
import { type ApiArticle } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import SafeImage from "@/components/SafeImage";
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
  breaking: ApiArticle[];
  categoryData: Record<string, ApiArticle[]>;
  aiArticles: ApiArticle[];
  popularKeywords: string[];
}

export default function HomeContent({ trending, breaking, categoryData, aiArticles, popularKeywords }: Props) {
  const headlines = trending.slice(0, 5);
  const breakingTitles = trending.slice(0, 4).map((a) => a.title);
  // Use breaking articles (recent 6h with summaries), fallback to trending
  const breakingArticles = breaking.length > 0 ? breaking : trending.slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <BreakingNewsTicker items={breakingTitles} />

      <main className="max-w-[1200px] mx-auto px-3 md:px-4 py-5 md:py-8">
        <HeadlineSection articles={headlines} />

        {/* Breaking News — Recent articles with AI summaries */}
        {breakingArticles.length > 0 && (
          <section className="mb-6 md:mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-5 w-5 text-red-500 fill-red-500" />
              <h2 className="text-lg font-bold">Breaking News</h2>
              <span className="text-xs text-muted-foreground">Latest headlines with AI summaries</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {breakingArticles.slice(0, 5).map((article, i) => (
                <a
                  key={`breaking-${i}`}
                  href={article.url}
                  className="group block p-3 rounded-lg border border-red-500/20 hover:border-red-500/50 hover:bg-red-500/5 transition-all"
                >
                  <div className="aspect-video rounded overflow-hidden mb-2">
                    <SafeImage
                      src={article.thumbnail}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
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
              categoryData={categoryData}
              renderMidAd={
                <InlineAd slot="bottom-home" className="my-5" />
              }
            />
          </div>
          <div className="lg:col-span-1">
            <Sidebar articles={trending.slice(0, 10)} />
          </div>
        </div>
      </main>

      <Footer />
      <ScrollToTop />
      <ReadingProgress />
    </div>
  );
}
