"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import AdUnit from "@/components/AdUnit";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, type ApiArticle } from "@/lib/api";
import { articleLink } from "@/lib/link";
import { Globe } from "lucide-react";
import SafeImage from "@/components/SafeImage";

const WORLD_TOPICS = [
  { label: "All", dbCategory: null },
  { label: "Business", dbCategory: "business" },
  { label: "Tech", dbCategory: "technology" },
  { label: "Sports", dbCategory: "sports" },
  { label: "Entertainment", dbCategory: "entertainment" },
  { label: "Science", dbCategory: "science" },
  { label: "Health", dbCategory: "health" },
];

function InlineAd({ slot, className = "" }: { slot: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-[10px] text-muted-foreground/50 text-center mb-1">Ad</p>
      <AdUnit slot={slot} />
    </div>
  );
}

function dbArticleToApi(a: Record<string, unknown>): ApiArticle {
  return {
    title: (a.title as string) || "",
    url: `/news/${a.slug as string}`,
    excerpt: (a.excerpt as string) || "",
    thumbnail: (a.image_url as string) || "",
    language: "en",
    date: (a.published_at as string) || (a.created_at as string) || "",
    authors: [],
    publisher: { name: (a.publisher as string) || "", url: "", favicon: "" },
  };
}

export default function WorldNewsPage() {
  const [articles, setArticles] = useState<ApiArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    document.title = "World News - Headlines Fazr";
  }, []);

  useEffect(() => {
    setLoading(true);
    async function load() {
      const topic = WORLD_TOPICS[activeIdx];
      const params = new URLSearchParams({ action: "by-category", limit: "20" });
      if (topic.dbCategory) params.set("category", topic.dbCategory);

      const res = await fetch(`/api/articles?${params}`);
      const json = await res.json();
      const mapped = ((json.data || []) as Record<string, unknown>[]).map(dbArticleToApi);
      setArticles(mapped);
      setLoading(false);
    }
    load();
  }, [activeIdx]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-[1200px] mx-auto px-3 md:px-4 py-5 md:py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <nav className="text-xs text-muted-foreground mb-1">
              <a href="/" className="hover:text-primary transition-colors">Home</a>
              <span className="mx-1.5">/</span>
              <span className="text-foreground font-medium">World News</span>
            </nav>
            <h1 className="font-headline text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
              <Globe className="h-7 w-7 text-primary" />
              World News
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Stay informed with the latest global news</p>
          </div>
        </div>

        {/* Topic tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {WORLD_TOPICS.map((t, idx) => (
            <Badge
              key={t.label}
              variant={activeIdx === idx ? "default" : "outline"}
              className="cursor-pointer shrink-0 hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => setActiveIdx(idx)}
            >
              {t.label}
            </Badge>
          ))}
        </div>

        <Separator className="mb-6" />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="border-0 shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-40 w-full rounded-md" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Featured */}
            {articles[0] && (
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow mb-6 overflow-hidden py-0">
                <a href={articleLink(articles[0].url, articles[0].title, articles[0].publisher.name)} className="block md:flex">
                  <SafeImage
                    src={articles[0].thumbnail}
                    alt={articles[0].title}
                    className="w-full md:w-1/2 h-48 md:h-64 object-cover"
                  />
                  <CardContent className="p-5 md:p-6 flex flex-col justify-center">
                    <Badge variant="outline" className="mb-2 w-fit text-xs text-primary border-primary/30">
                      {articles[0].publisher.name}
                    </Badge>
                    <h2 className="font-headline text-xl md:text-2xl font-bold text-card-foreground leading-tight mb-2 hover:text-primary transition-colors">
                      {articles[0].title}
                    </h2>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                      {articles[0].excerpt}
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                      {articles[0].publisher.name} · {formatDate(articles[0].date)}
                    </p>
                  </CardContent>
                </a>
              </Card>
            )}

            <InlineAd slot="top-topic" className="mb-6" />

            {/* Article grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {articles.slice(1).map((article, i) => (
                <Card key={i} className="border-0 shadow-sm hover:shadow-md transition-shadow py-0 gap-0">
                  <a href={articleLink(article.url, article.title, article.publisher.name)} className="block">
                    <SafeImage
                      src={article.thumbnail}
                      alt={article.title}
                      className="w-full h-40 object-cover rounded-t-lg"
                      loading="lazy"
                    />
                    <CardContent className="p-4">
                      <h3 className="text-sm font-semibold text-card-foreground leading-snug mb-1.5 hover:text-primary transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {article.excerpt}
                      </p>
                      <p className="text-xs text-muted-foreground/60">
                        {article.publisher.name} · {formatDate(article.date)}
                      </p>
                    </CardContent>
                  </a>
                </Card>
              ))}
            </div>

            <InlineAd slot="bottom-topic" className="mt-6" />
          </>
        )}
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
}
