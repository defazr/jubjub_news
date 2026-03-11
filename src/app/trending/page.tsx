import type { Metadata } from "next";
import { getPopularKeywords, getKeywordsByCategory, getLatestArticles, articleToApiArticle } from "@/lib/articles";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdUnit from "@/components/AdUnit";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Flame, Hash } from "lucide-react";

export const revalidate = 600; // ISR: 10 minutes

const SITE_URL = "https://headlines.fazr.co.kr";

export const metadata: Metadata = {
  title: "Trending Topics - What's Hot Right Now | Headlines Fazr",
  description: "Discover the hottest trending topics in AI, technology, business, and more. Real-time trending news powered by AI curation.",
  alternates: { canonical: `${SITE_URL}/trending` },
  openGraph: {
    title: "Trending Topics - What's Hot Right Now",
    description: "Discover the hottest trending topics in AI, technology, business, and more.",
    url: `${SITE_URL}/trending`,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Trending Topics - What's Hot Right Now | Headlines Fazr",
    description: "Discover the hottest trending topics in AI, technology, business, and more.",
  },
};

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  ai: { label: "AI", color: "text-violet-500" },
  technology: { label: "Tech", color: "text-blue-500" },
  business: { label: "Business", color: "text-emerald-500" },
  science: { label: "Science", color: "text-amber-500" },
  world: { label: "World", color: "text-red-500" },
  sports: { label: "Sports", color: "text-orange-500" },
  health: { label: "Health", color: "text-pink-500" },
  entertainment: { label: "Entertainment", color: "text-cyan-500" },
};

export default async function TrendingPage() {
  const categories = Object.keys(CATEGORY_LABELS);

  const [topKeywords, categoryKeywords, latestArticles] = await Promise.all([
    getPopularKeywords(50),
    getKeywordsByCategory(categories, 10),
    getLatestArticles(10),
  ]);

  const latestApi = latestArticles.map(articleToApiArticle);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-[1200px] mx-auto px-4 py-6">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <Flame className="h-7 w-7 text-orange-500" />
            Trending Topics
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            What&apos;s hot right now — real-time trending topics powered by AI curation
          </p>
        </div>

        <AdUnit slot="top-topic" className="mb-6" />

        {/* Top trending keywords */}
        <section className="mb-8">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            Top Trending
          </h2>
          <div className="flex flex-wrap gap-2">
            {topKeywords.slice(0, 20).map((kw, i) => (
              <a key={kw} href={`/topic/${encodeURIComponent(kw)}`}>
                <Badge
                  variant={i < 5 ? "default" : "secondary"}
                  className="text-sm px-3 py-1 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                >
                  <span className="mr-1.5 text-xs opacity-60">#{i + 1}</span>
                  {kw}
                </Badge>
              </a>
            ))}
          </div>
        </section>

        {/* Category trending */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {categories.map((cat) => {
            const info = CATEGORY_LABELS[cat];
            const keywords = categoryKeywords[cat] || [];
            if (keywords.length === 0) return null;
            return (
              <section key={cat} className="border border-border rounded-lg p-4">
                <h3 className={`text-sm font-bold mb-3 ${info.color}`}>
                  {info.label} Topics
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {keywords.map((kw) => (
                    <a
                      key={kw}
                      href={`/topic/${encodeURIComponent(kw)}`}
                      className="text-xs px-2 py-0.5 rounded-full border border-border hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      {kw}
                    </a>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Latest stories */}
        <section className="mb-8">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Hash className="h-5 w-5 text-primary" />
            Latest Stories
          </h2>
          <div className="space-y-3">
            {latestApi.map((article, i) => (
              <a
                key={i}
                href={article.url}
                className="flex gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
              >
                {article.thumbnail && (
                  <img
                    src={article.thumbnail}
                    alt=""
                    className="w-20 h-14 object-cover rounded flex-shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <h3 className="text-sm font-medium line-clamp-2">{article.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {article.publisher.name}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>

        <AdUnit slot="bottom-topic" className="mt-6" />
      </main>
      <Footer />
    </div>
  );
}
