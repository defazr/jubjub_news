import type { Metadata } from "next";
import { getDigestArticles, getPopularKeywords, parseSummary } from "@/lib/articles";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdUnit from "@/components/AdUnit";
import TrendingTopics from "@/components/TrendingTopics";
import SafeImage from "@/components/SafeImage";
import { Newspaper, Sparkles } from "lucide-react";
import type { Article } from "@/types/database";

export const revalidate = 3600; // ISR: 1 hour

const SITE_URL = "https://headlines.fazr.co.kr";

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  technology: { label: "Tech", color: "#06b6d4" },
  business: { label: "Economy", color: "#22c55e" },
  world: { label: "World", color: "#a855f7" },
  ai: { label: "AI", color: "#8b5cf6" },
  science: { label: "Science", color: "#3b82f6" },
  sports: { label: "Sports", color: "#ef4444" },
};

export const metadata: Metadata = {
  title: "Daily AI News Digest | Headlines Fazr",
  description: "AI curated daily news digest covering technology, economy, world news and AI developments.",
  alternates: { canonical: `${SITE_URL}/digest` },
  openGraph: {
    title: "Daily AI News Digest | Headlines Fazr",
    description: "AI curated daily news digest covering technology, economy, world news and AI developments.",
    url: `${SITE_URL}/digest`,
    type: "website",
    images: [{ url: `${SITE_URL}/Headlines_Fazr_OG_image.webp`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Daily AI News Digest | Headlines Fazr",
    description: "AI curated daily news digest covering technology, economy, world news and AI developments.",
  },
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function DigestCard({ article }: { article: Article }) {
  const { summaryText } = parseSummary(article.summary);
  return (
    <a href={`/news/${article.slug}`} className="group block">
      <div className="flex gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
        <div className="w-20 h-14 rounded overflow-hidden shrink-0">
          <SafeImage
            src={article.image_url}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          {summaryText && (
            <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{summaryText}</p>
          )}
          <p className="text-[10px] text-muted-foreground/60 mt-1">
            {article.publisher && `${article.publisher} · `}
            {formatDate(article.created_at)}
          </p>
        </div>
      </div>
    </a>
  );
}

export default async function DigestPage() {
  const [digestData, popularKeywords] = await Promise.all([
    getDigestArticles(3),
    getPopularKeywords(15),
  ]);

  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-[800px] mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Newspaper className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold">Daily Digest</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {dateStr} · Today&apos;s top stories summarized by AI
          </p>
        </div>

        <AdUnit slot="top-article" className="mb-6" />

        {/* Category sections */}
        {Object.entries(CATEGORY_LABELS).map(([cat, { label, color }]) => {
          const articles = digestData[cat];
          if (!articles?.length) return null;

          return (
            <section key={cat} className="mb-6">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <h2 className="text-base font-bold">{label}</h2>
                <a
                  href={`/category/${cat === "business" ? "economy" : cat === "technology" ? "tech" : cat}`}
                  className="text-xs text-primary hover:underline ml-auto"
                >
                  View all
                </a>
              </div>
              <div className="space-y-1">
                {articles.map((article) => (
                  <DigestCard key={article.id} article={article} />
                ))}
              </div>
            </section>
          );
        })}

        <AdUnit slot="mid-article" className="my-6" />

        {/* AI Summary notice */}
        <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">AI-Powered Digest</span>
          </div>
          <p className="text-xs text-muted-foreground">
            All summaries are generated by AI. For complete coverage, click through to read the full articles.
          </p>
        </div>

        <TrendingTopics keywords={popularKeywords} className="mb-6" />

        <AdUnit slot="bottom-article" className="mt-6" />
      </main>
      <Footer />
    </div>
  );
}
