import Header from "@/components/Header";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import HeadlineSection from "@/components/HeadlineSection";
import CategorySection from "@/components/CategorySection";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <BreakingNewsTicker />

      <main className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="bg-white p-6 shadow-sm">
          {/* Headlines */}
          <HeadlineSection />

          {/* Main content with sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <CategorySection />
            </div>
            <div className="lg:col-span-1">
              <Sidebar />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
