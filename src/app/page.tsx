"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import HeadlineSection from "@/components/HeadlineSection";
import CategorySection from "@/components/CategorySection";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import AdUnit from "@/components/AdUnit";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { fetchTrendingNews, searchNews, type ApiArticle } from "@/lib/api";

const CACHE_KEY = "jubjub_news_cache";
const CACHE_TTL = 3 * 60 * 60 * 1000; // 3 hours

interface CachedNews {
  trending: ApiArticle[];
  categories: Record<string, ApiArticle[]>;
  ts: number;
}

function loadCache(): CachedNews | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: CachedNews = JSON.parse(raw);
    if (Date.now() - parsed.ts < CACHE_TTL) return parsed;
  } catch { /* ignore */ }
  return null;
}

function saveCache(trending: ApiArticle[], categories: Record<string, ApiArticle[]>) {
  try {
    const data: CachedNews = { trending, categories, ts: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const CATEGORY_QUERIES: [string, string][] = [
  ["정치", "한국 정치 국회"],
  ["경제", "한국 경제 금융"],
  ["사회", "한국 사회 사건"],
  ["국제", "국제 세계 외교"],
  ["문화", "한국 문화 예술 연예"],
  ["IT/과학", "IT 기술 과학 AI"],
  ["스포츠", "스포츠 축구 야구"],
  ["오피니언", "사설 칼럼 오피니언"],
];

async function fetchWithRetry(query: string, retries = 1): Promise<ApiArticle[]> {
  for (let i = 0; i <= retries; i++) {
    const result = await searchNews(query);
    if (result.length > 0) return result;
    if (i < retries) await delay(800);
  }
  return [];
}

function InlineAd({ slot, className = "" }: { slot: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-[10px] text-muted-foreground/50 text-center mb-1">광고</p>
      <AdUnit slot={slot} />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="md:col-span-2 border-0 shadow-sm">
          <CardContent className="p-0">
            <Skeleton className="h-64 w-full rounded-t-lg" />
            <div className="p-5 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardContent>
        </Card>
        <div className="space-y-5">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 space-y-3">
              <Skeleton className="h-32 w-full rounded-md" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 space-y-2.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
      <Separator />
    </div>
  );
}

export default function Home() {
  const [trending, setTrending] = useState<ApiArticle[]>([]);
  const [categoryData, setCategoryData] = useState<Record<string, ApiArticle[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNews() {
      const cached = loadCache();
      if (cached) {
        setTrending(cached.trending);
        setCategoryData(cached.categories);
        setLoading(false);
        return;
      }

      const trendingData = await fetchTrendingNews("general");
      setTrending(trendingData);
      setLoading(false);

      const categories: Record<string, ApiArticle[]> = {};
      for (let i = 0; i < CATEGORY_QUERIES.length; i += 2) {
        const batch = CATEGORY_QUERIES.slice(i, i + 2);
        const results = await Promise.all(
          batch.map(([, query]) => fetchWithRetry(query))
        );
        batch.forEach(([name], idx) => {
          categories[name] = results[idx].slice(0, 5);
        });
        setCategoryData({ ...categories });
        if (i + 2 < CATEGORY_QUERIES.length) await delay(600);
      }
      saveCache(trendingData, categories);
    }
    loadNews();
  }, []);

  const headlines = trending.slice(0, 5);
  const breakingTitles = trending.slice(0, 4).map((a) => `속보: ${a.title}`);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <BreakingNewsTicker items={breakingTitles} />

      <main className="max-w-[1200px] mx-auto px-3 md:px-4 py-5 md:py-8">
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <HeadlineSection articles={headlines} />

            {/* 광고 1: 헤드라인 아래 (전면 배너) */}
            <InlineAd slot="9121339058" className="my-5" />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <CategorySection
                  categoryData={categoryData}
                  renderMidAd={
                    <InlineAd slot="2248808942" className="my-5" />
                  }
                />
                {/* 광고 3: 카테고리 하단 (전면 배너) */}
                <InlineAd slot="9121339058" className="mt-5" />
              </div>
              <div className="lg:col-span-1">
                <Sidebar articles={trending.slice(0, 10)} />
                {/* 광고 4: 사이드바 하단 */}
                <InlineAd slot="2248808942" className="mt-5" />
                {/* 광고 5: 사이드바 추가 */}
                <InlineAd slot="9121339058" className="mt-5" />
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
}
