"use client";

import { useEffect, useState } from "react";
import { type ApiArticle, formatDate } from "@/lib/api";
import { articleLink } from "@/lib/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import BookmarkButton from "@/components/BookmarkButton";
import ShareButton from "@/components/ShareButton";
import { getReadUrls, getLayout, setLayoutPref } from "@/lib/storage";
import { getCategoryByName } from "@/lib/categories";
import { LayoutGrid, List } from "lucide-react";

interface Props {
  categoryData: Record<string, ApiArticle[]>;
  renderMidAd?: React.ReactNode;
}

function CategoryCard({ cat, articles, animDelay, readUrls }: { cat: string; articles: ApiArticle[]; animDelay: number; readUrls: Set<string> }) {
  const featured = articles[0];
  const rest = articles.slice(1);
  const catInfo = getCategoryByName(cat);
  const accentColor = catInfo?.color || "var(--primary)";

  return (
    <Card
      id={`category-${cat}`}
      className={`border-0 shadow-sm hover:shadow-md transition-all duration-300 scroll-mt-16 animate-fade-in-up animate-delay-${animDelay} py-0 gap-0`}
      style={{ borderTop: `3px solid ${accentColor}` }}
    >
      <CardHeader className="pb-0 pt-4 px-4">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <span className="w-1 h-4 rounded-full" style={{ backgroundColor: accentColor }} />
          {cat}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-3">
        {featured && (
          <div className="mb-3">
            <a
              href={articleLink(featured.url, featured.title, featured.publisher.name)}
              className="block group"
            >
              {featured.thumbnail && (
                <div className="relative w-full aspect-video mb-2.5 overflow-hidden rounded-md bg-muted">
                  <img
                    src={featured.thumbnail}
                    alt={featured.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              )}
              <span className={`text-sm font-semibold text-card-foreground group-hover:text-primary leading-snug block transition-colors line-clamp-2 ${readUrls.has(featured.url) ? "opacity-60" : ""}`}>
                {featured.title}
                {readUrls.has(featured.url) && <span className="ml-1 text-[10px] font-normal text-muted-foreground bg-muted px-1 py-0.5 rounded">읽음</span>}
              </span>
              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                {featured.excerpt}
              </p>
            </a>
            <div className="flex items-center justify-between mt-1.5">
              <p className="text-xs text-muted-foreground/60">
                {featured.publisher.name} · {formatDate(featured.date)}
              </p>
              <div className="flex items-center gap-0.5">
                <ShareButton url={featured.url} title={featured.title} className="shrink-0" />
                <BookmarkButton article={featured} className="shrink-0 p-1" />
              </div>
            </div>
          </div>
        )}

        <Separator className="my-2" />

        <ul className="space-y-2.5">
          {rest.map((article, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <a
                href={articleLink(article.url, article.title, article.publisher.name)}
                className={`flex-1 text-sm text-card-foreground hover:text-primary leading-snug transition-colors line-clamp-2 ${readUrls.has(article.url) ? "opacity-60" : ""}`}
              >
                {article.title}
              </a>
              <ShareButton url={article.url} title={article.title} className="shrink-0" />
              <BookmarkButton article={article} className="shrink-0 p-1" />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export default function CategorySection({ categoryData, renderMidAd }: Props) {
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

  const displayCategories = Object.keys(categoryData).filter(
    (cat) => categoryData[cat] && categoryData[cat].length > 0
  );

  if (displayCategories.length === 0) {
    return (
      <section className="mb-6 md:mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-20" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-36 w-full rounded-md" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Separator />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  const firstHalf = displayCategories.slice(0, 4);
  const secondHalf = displayCategories.slice(4);

  const gridClass = layout === "list"
    ? "grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5"
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5";

  return (
    <section className="mb-6 md:mb-8">
      {/* Layout toggle */}
      <div className="flex justify-end mb-3">
        <button
          onClick={toggleLayout}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-accent"
          title={layout === "grid" ? "리스트 보기" : "그리드 보기"}
        >
          {layout === "grid" ? <List className="h-3.5 w-3.5" /> : <LayoutGrid className="h-3.5 w-3.5" />}
          {layout === "grid" ? "리스트" : "그리드"}
        </button>
      </div>

      {/* 카테고리 1~4 */}
      <div className={gridClass}>
        {firstHalf.map((cat, i) => (
          <CategoryCard key={cat} cat={cat} articles={categoryData[cat]} animDelay={i + 1} readUrls={readUrls} />
        ))}
      </div>

      {/* 광고 2: 카테고리 중간 */}
      {renderMidAd}

      {/* 카테고리 5~8 */}
      {secondHalf.length > 0 && (
        <div className={gridClass}>
          {secondHalf.map((cat, i) => (
            <CategoryCard key={cat} cat={cat} articles={categoryData[cat]} animDelay={i + 5} readUrls={readUrls} />
          ))}
        </div>
      )}
    </section>
  );
}
