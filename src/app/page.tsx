import Header from "@/components/Header";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import HeadlineSection from "@/components/HeadlineSection";
import CategorySection from "@/components/CategorySection";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { fetchTrendingNews, searchNews, type ApiArticle } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [trending, politics, economy, tech, sports] = await Promise.all([
    fetchTrendingNews("general"),
    searchNews("한국 정치"),
    searchNews("한국 경제"),
    searchNews("IT 기술 과학"),
    searchNews("스포츠 한국"),
  ]);

  const headlines = trending.slice(0, 5);
  const breakingTitles = trending.slice(0, 4).map((a) => `속보: ${a.title}`);

  const categoryData: Record<string, ApiArticle[]> = {
    정치: politics.slice(0, 4),
    경제: economy.slice(0, 4),
    "IT/과학": tech.slice(0, 4),
    스포츠: sports.slice(0, 4),
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <BreakingNewsTicker items={breakingTitles} />

      <main className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="bg-white p-6 shadow-sm">
          <HeadlineSection articles={headlines} />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <CategorySection categoryData={categoryData} />
            </div>
            <div className="lg:col-span-1">
              <Sidebar articles={trending.slice(0, 10)} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
