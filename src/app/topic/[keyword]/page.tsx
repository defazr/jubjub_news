import type { Metadata } from "next";
import { getArticlesByKeyword, getPopularKeywords } from "@/lib/articles";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdUnit from "@/components/AdUnit";
import TopicArticleList from "./TopicArticleList";
import { Badge } from "@/components/ui/badge";
import { Hash } from "lucide-react";

export const revalidate = 600; // ISR: 10 minutes

interface Props {
  params: Promise<{ keyword: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { keyword } = await params;
  const decoded = decodeURIComponent(keyword);
  return {
    title: `${decoded} News and Updates - JubJub News`,
    description: `Latest ${decoded} news, updates, and analysis. Stay informed with AI-summarized articles about ${decoded}.`,
    alternates: {
      canonical: `https://headlines.fazr.co.kr/topic/${keyword}`,
    },
    openGraph: {
      title: `${decoded} News and Updates`,
      description: `Latest ${decoded} news, updates, and analysis.`,
      url: `https://headlines.fazr.co.kr/topic/${keyword}`,
      type: "website",
    },
  };
}

export default async function TopicPage({ params }: Props) {
  const { keyword } = await params;
  const decoded = decodeURIComponent(keyword);

  const [articles, popularKeywords] = await Promise.all([
    getArticlesByKeyword(decoded, 30),
    getPopularKeywords(20),
  ]);

  // Related topics: exclude current keyword
  const relatedTopics = popularKeywords.filter(
    (kw) => kw.toLowerCase() !== decoded.toLowerCase()
  ).slice(0, 12);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="mb-6">
          <nav className="text-xs text-muted-foreground mb-1">
            <a href="/" className="hover:text-primary transition-colors">Home</a>
            <span className="mx-1.5">/</span>
            <a href="/ai" className="hover:text-primary transition-colors">AI News</a>
            <span className="mx-1.5">/</span>
            <span className="text-foreground font-medium">#{decoded}</span>
          </nav>
          <h1 className="text-2xl font-bold">
            AI News about <span className="text-primary">{decoded}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Latest news and AI summaries about {decoded} · {articles.length} articles
          </p>
        </div>

        <AdUnit slot="9121339058" className="mb-6" />

        <TopicArticleList articles={articles} />

        <AdUnit slot="2248808942" className="mt-6" />

        {/* Related Topics - Internal Linking */}
        {relatedTopics.length > 0 && (
          <section className="mt-8">
            <h2 className="text-sm font-bold flex items-center gap-2 mb-3">
              <Hash className="h-4 w-4 text-primary" />
              Related Topics
            </h2>
            <div className="flex flex-wrap gap-2">
              {relatedTopics.map((kw) => (
                <a key={kw} href={`/topic/${encodeURIComponent(kw)}`}>
                  <Badge
                    variant="outline"
                    className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                  >
                    #{kw}
                  </Badge>
                </a>
              ))}
            </div>
          </section>
        )}

        <AdUnit slot="9121339058" className="mt-6" />
      </main>
      <Footer />
    </div>
  );
}
