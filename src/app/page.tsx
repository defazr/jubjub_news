"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import HeadlineSection from "@/components/HeadlineSection";
import CategorySection from "@/components/CategorySection";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import AdUnit from "@/components/AdUnit";
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

export default function Home() {
  const [trending, setTrending] = useState<ApiArticle[]>([]);
  const [categoryData, setCategoryData] = useState<
    Record<string, ApiArticle[]>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNews() {
      // Try cache first
      const cached = loadCache();
      if (cached) {
        setTrending(cached.trending);
        setCategoryData(cached.categories);
        setLoading(false);
        return;
      }

      // Fetch fresh data in batches of 2
      const trendingData = await fetchTrendingNews("general");
      setTrending(trendingData);

      const categories: Record<string, ApiArticle[]> = {};

      for (let i = 0; i < CATEGORY_QUERIES.length; i += 2) {
        const batch = CATEGORY_QUERIES.slice(i, i + 2);
        const results = await Promise.all(
          batch.map(([, query]) => fetchWithRetry(query))
        );
        batch.forEach(([name], idx) => {
          categories[name] = results[idx].slice(0, 5);
        });

        if (i + 2 < CATEGORY_QUERIES.length) await delay(600);
      }

      setCategoryData(categories);
      saveCache(trendingData, categories);
      setLoading(false);
    }
    loadNews();
  }, []);

  const headlines = trending.slice(0, 5);
  const breakingTitles = trending.slice(0, 4).map((a) => `속보: ${a.title}`);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <BreakingNewsTicker items={breakingTitles} />

      <main className="max-w-[1200px] mx-auto px-3 md:px-4 py-4 md:py-6">
        <div className="bg-white p-3 md:p-6 shadow-sm">
          {loading ? (
            <div className="text-center py-20 text-gray-500">
              <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-red-700 rounded-full animate-spin mb-4"></div>
              <p>최신 뉴스를 불러오는 중...</p>
            </div>
          ) : (
            <>
              <HeadlineSection articles={headlines} />
              <AdUnit slot="9121339058" className="my-4" />
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                  <CategorySection categoryData={categoryData} />
                </div>
                <div className="lg:col-span-1">
                  <Sidebar articles={trending.slice(0, 10)} />
                  <AdUnit slot="2248808942" className="mt-6" />
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
