"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import AdUnit from "@/components/AdUnit";
import TranslateButton from "@/components/TranslateButton";
import BookmarkButton from "@/components/BookmarkButton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { translateTexts, formatDate, type ApiArticle } from "@/lib/api";
import { articleLink } from "@/lib/link";
import { SearchIcon } from "lucide-react";
import { getReadUrls, addSearchHistory } from "@/lib/storage";
import { supabase } from "@/lib/supabase";

function InlineAd({ slot, className = "" }: { slot: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-[10px] text-muted-foreground/50 text-center mb-1">광고</p>
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

async function searchArticlesFromDB(query: string): Promise<ApiArticle[]> {
  const { data } = await supabase
    .from("articles")
    .select("*")
    .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`)
    .order("created_at", { ascending: false })
    .limit(20);
  return (data || []).map(dbArticleToApi);
}

function SearchContent() {
  const params = useSearchParams();
  const query = params.get("q") || "";

  const [articles, setArticles] = useState<ApiArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [translated, setTranslated] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [originalArticles, setOriginalArticles] = useState<ApiArticle[]>([]);
  const [readUrls, setReadUrls] = useState<Set<string>>(new Set());

  useEffect(() => {
    setReadUrls(getReadUrls());
  }, []);

  useEffect(() => {
    if (!query) {
      document.title = "검색 - JubJub 뉴스";
      setLoading(false);
      return;
    }
    document.title = `"${query}" 검색 결과 - JubJub 뉴스`;
    addSearchHistory(query);
    setLoading(true);
    setTranslated(false);
    async function load() {
      const data = await searchArticlesFromDB(query);
      setArticles(data);
      setOriginalArticles(data);
      setLoading(false);
    }
    load();
  }, [query]);

  async function handleTranslate() {
    if (translating) return;
    if (translated) {
      setArticles(originalArticles);
      setTranslated(false);
      return;
    }
    setTranslating(true);
    const texts = articles.flatMap((a) => [a.title, a.excerpt]);
    const result = await translateTexts(texts, "en");
    const updated = articles.map((a, i) => ({
      ...a,
      title: result[i * 2] || a.title,
      excerpt: result[i * 2 + 1] || a.excerpt,
    }));
    setArticles(updated);
    setTranslated(true);
    setTranslating(false);
  }

  function handleSearch(newQuery: string) {
    window.location.href = `/search?q=${encodeURIComponent(newQuery)}`;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={handleSearch} />

      <main className="max-w-[1200px] mx-auto px-3 md:px-4 py-5 md:py-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <nav className="text-xs text-muted-foreground mb-1">
              <a href="/" className="hover:text-primary transition-colors">홈</a>
              <span className="mx-1.5">/</span>
              <span className="text-foreground font-medium">검색 결과</span>
            </nav>
            <h1 className="font-headline text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
              <SearchIcon className="h-7 w-7 text-primary" />
              &ldquo;{query}&rdquo; 검색 결과
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {loading ? "검색 중..." : `${articles.length}개의 결과`}
            </p>
          </div>
          {articles.length > 0 && (
            <TranslateButton
              translated={translated}
              translating={translating}
              targetLabel="English"
              onToggle={handleTranslate}
            />
          )}
        </div>

        <Separator className="mb-6" />

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="border-0 shadow-sm">
                <CardContent className="p-4 flex gap-4">
                  <Skeleton className="h-24 w-32 rounded-md shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16">
            <SearchIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg text-muted-foreground mb-2">
              {query ? "검색 결과가 없습니다" : "검색어를 입력해주세요"}
            </p>
            <p className="text-sm text-muted-foreground/60">
              다른 키워드로 검색해보세요
            </p>
          </div>
        ) : (
          <>
            <InlineAd slot="9121339058" className="mb-6" />

            <div className="space-y-4">
              {articles.map((article, i) => (
                <Card key={i} className="border-0 shadow-sm hover:shadow-md transition-shadow py-0 gap-0">
                  <a href={articleLink(article.url, article.title, article.publisher.name)} className="block sm:flex">
                    {article.thumbnail && (
                      <img
                        src={article.thumbnail}
                        alt={article.title}
                        className="w-full sm:w-48 h-32 sm:h-auto object-cover rounded-t-lg sm:rounded-t-none sm:rounded-l-lg shrink-0"
                        loading="lazy"
                      />
                    )}
                    <CardContent className="p-4 flex flex-col justify-center flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <Badge variant="outline" className="mb-1.5 w-fit text-xs text-primary border-primary/30">
                          {article.publisher.name}
                        </Badge>
                        <BookmarkButton article={article} />
                      </div>
                      <h3 className={`text-base font-semibold text-card-foreground leading-snug mb-1 hover:text-primary transition-colors line-clamp-2 ${readUrls.has(article.url) ? "opacity-60" : ""}`}>
                        {article.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {article.excerpt}
                      </p>
                      <p className="text-xs text-muted-foreground/60">
                        {formatDate(article.date)}
                      </p>
                    </CardContent>
                  </a>
                </Card>
              ))}
            </div>

            <InlineAd slot="2248808942" className="mt-6" />
          </>
        )}
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Skeleton className="h-8 w-48" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
