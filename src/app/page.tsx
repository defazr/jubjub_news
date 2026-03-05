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

export default function Home() {
  const [trending, setTrending] = useState<ApiArticle[]>([]);
  const [categoryData, setCategoryData] = useState<
    Record<string, ApiArticle[]>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

    async function loadNews() {
      // Batch 1: trending headlines + topic-based headlines (uses top-headlines endpoint)
      const [trendingData, business, world, tech, sports, entertainment] =
        await Promise.all([
          fetchTrendingNews("general"),
          fetchTrendingNews("BUSINESS"),
          fetchTrendingNews("WORLD"),
          fetchTrendingNews("TECHNOLOGY"),
          fetchTrendingNews("SPORTS"),
          fetchTrendingNews("ENTERTAINMENT"),
        ]);

      setTrending(trendingData);

      await delay(300);

      // Batch 2: search-based categories for topics without a matching headline topic
      const [politics, society, opinion] = await Promise.all([
        searchNews("한국 정치 국회"),
        searchNews("한국 사회 사건"),
        searchNews("사설 오피니언 칼럼"),
      ]);

      setCategoryData({
        정치: politics.slice(0, 5),
        경제: business.slice(0, 5),
        사회: society.slice(0, 5),
        국제: world.slice(0, 5),
        문화: entertainment.slice(0, 5),
        "IT/과학": tech.slice(0, 5),
        스포츠: sports.slice(0, 5),
        오피니언: opinion.slice(0, 5),
      });
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
