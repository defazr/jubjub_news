"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import ReadingProgress from "@/components/ReadingProgress";
import AdUnit from "@/components/AdUnit";
import BookmarkButton from "@/components/BookmarkButton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, LayoutGrid, List } from "lucide-react";
import { formatDate, type ApiArticle } from "@/lib/api";
import { CATEGORIES, type CategoryInfo } from "@/lib/categories";
import { articleLink } from "@/lib/link";
import { getReadUrls, getLayout, setLayoutPref } from "@/lib/storage";
import ShareButton from "@/components/ShareButton";
import SafeImage from "@/components/SafeImage";

function InlineAd({ slot, className = "" }: { slot: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-[10px] text-muted-foreground/50 text-center mb-1">Ad</p>
      <AdUnit slot={slot} />
    </div>
  );
}

const INITIAL_COUNT = 6;
const LOAD_MORE_COUNT = 6;

interface Props {
  category: CategoryInfo;
  /** Pre-fetched articles from Supabase (SSR) */
  initialArticles?: ApiArticle[];
}

export default function CategoryPageContent({ category, initialArticles }: Props) {
  const [articles] = useState<ApiArticle[]>(initialArticles || []);
  const [loading] = useState(!initialArticles);
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const [readUrls, setReadUrls] = useState<Set<string>>(new Set());
  const [layout, setLayout] = useState<"grid" | "list">("grid");

  useEffect(() => {
    setReadUrls(getReadUrls());
    setLayout(getLayout());
  }, []);

  function toggleLayout() {
    const next = layout === "grid" ? "list" : "grid";
    setLayout(next);
    setLayoutPref(next);
  }

  useEffect(() => {
    document.title = `${category.name} - Headlines Fazr`;
  }, [category]);

  function handleLoadMore() {
    setVisibleCount((prev) => prev + LOAD_MORE_COUNT);
  }

  const visibleArticles = articles.slice(0, visibleCount);
  const hasMore = visibleCount < articles.length;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-[1200px] mx-auto px-3 md:px-4 py-5 md:py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <nav className="text-xs text-muted-foreground mb-1">
              <a href="/" className="hover:text-primary transition-colors">Home</a>
              <span className="mx-1.5">/</span>
              <span className="text-foreground font-medium">{category.name}</span>
            </nav>
            <h1 className="font-headline text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
              <span className="w-1.5 h-6 rounded-full" style={{ backgroundColor: category.color }} />
              {category.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
          </div>
        </div>

        <Separator className="mb-6" />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
            {articles[0] && (
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow mb-6 overflow-hidden py-0">
                <a href={articleLink(articles[0].url, articles[0].title, articles[0].publisher.name)} className="block md:flex">
                  <SafeImage
                    src={articles[0].thumbnail}
                    alt={articles[0].title}
                    className="w-full md:w-1/2 h-48 md:h-64 object-cover"
                  />
                  <CardContent className="p-5 md:p-6 flex flex-col justify-center">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="outline" className="mb-2 w-fit text-xs text-primary border-primary/30">
                        {articles[0].publisher.name}
                      </Badge>
                      <div className="flex items-center gap-1">
                      <ShareButton url={articles[0].url} title={articles[0].title} />
                      <BookmarkButton article={articles[0]} />
                    </div>
                    </div>
                    <h2 className={`font-headline text-xl md:text-2xl font-bold text-card-foreground leading-tight mb-2 hover:text-primary transition-colors ${readUrls.has(articles[0].url) ? "opacity-60" : ""}`}>
                      {articles[0].title}
                      {readUrls.has(articles[0].url) && <span className="ml-2 text-xs font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded align-middle">Read</span>}
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

            <div className="flex justify-end mb-3">
              <button
                onClick={toggleLayout}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-accent"
                title={layout === "grid" ? "List view" : "Grid view"}
              >
                {layout === "grid" ? <List className="h-3.5 w-3.5" /> : <LayoutGrid className="h-3.5 w-3.5" />}
                {layout === "grid" ? "List" : "Grid"}
              </button>
            </div>

            <div className={layout === "list" ? "grid grid-cols-1 gap-4" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"}>
              {visibleArticles.slice(1).map((article, i) => (
                <Card key={i} className="border-0 shadow-sm hover:shadow-md transition-shadow py-0 gap-0 overflow-hidden">
                  <a href={articleLink(article.url, article.title, article.publisher.name)} className={layout === "list" ? "flex" : "block"}>
                    <SafeImage
                      src={article.thumbnail}
                      alt={article.title}
                      className={layout === "list" ? "w-40 md:w-52 h-28 md:h-32 object-cover shrink-0" : "w-full h-40 object-cover"}
                      loading="lazy"
                    />
                    <CardContent className="p-3 md:p-4 flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`text-sm font-semibold text-card-foreground leading-snug mb-1 hover:text-primary transition-colors line-clamp-2 flex-1 ${readUrls.has(article.url) ? "opacity-60" : ""}`}>
                          {article.title}
                          {readUrls.has(article.url) && <span className="ml-1 text-[10px] font-normal text-muted-foreground bg-muted px-1 py-0.5 rounded">Read</span>}
                        </h3>
                        <div className="flex items-center gap-0.5 shrink-0">
                          <ShareButton url={article.url} title={article.title} />
                          <BookmarkButton article={article} />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-1.5">
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

            {/* 더보기 버튼 */}
            {hasMore && (
              <div className="flex justify-center mt-6">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  className="gap-2"
                >
                  <ChevronDown className="h-4 w-4" />
                  Load more ({articles.length - visibleCount} remaining)
                </Button>
              </div>
            )}

            <InlineAd slot="bottom-topic" className="mt-6" />

            <div className="mt-8">
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-primary rounded-full" />
                Other Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.filter((c) => c.slug !== category.slug).map((c) => (
                  <a key={c.slug} href={`/category/${c.slug}`}>
                    <Badge variant="outline" className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
                      {c.name}
                    </Badge>
                  </a>
                ))}
                <a href="/world">
                  <Badge variant="outline" className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
                    World News
                  </Badge>
                </a>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
      <ScrollToTop />
      <ReadingProgress />
    </div>
  );
}
