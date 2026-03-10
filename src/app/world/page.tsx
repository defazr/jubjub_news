"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import AdUnit from "@/components/AdUnit";
import TranslateButton from "@/components/TranslateButton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { translateTexts, formatDate, type ApiArticle } from "@/lib/api";
import { articleLink } from "@/lib/link";
import { Globe } from "lucide-react";
import { supabase } from "@/lib/supabase";

const WORLD_TOPICS = [
  { label: "전체", dbCategory: null },
  { label: "비즈니스", dbCategory: "business" },
  { label: "테크", dbCategory: "technology" },
  { label: "스포츠", dbCategory: "sports" },
  { label: "엔터", dbCategory: "entertainment" },
  { label: "과학", dbCategory: "science" },
  { label: "건강", dbCategory: "health" },
];

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

export default function WorldNewsPage() {
  const [articles, setArticles] = useState<ApiArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [translated, setTranslated] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [originalArticles, setOriginalArticles] = useState<ApiArticle[]>([]);

  useEffect(() => {
    document.title = "해외 뉴스 - JubJub 뉴스";
  }, []);

  useEffect(() => {
    setLoading(true);
    setTranslated(false);
    async function load() {
      const topic = WORLD_TOPICS[activeIdx];
      let query = supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (topic.dbCategory) {
        query = query.eq("category", topic.dbCategory);
      }

      const { data } = await query;
      const mapped = (data || []).map(dbArticleToApi);
      setArticles(mapped);
      setOriginalArticles(mapped);
      setLoading(false);
    }
    load();
  }, [activeIdx]);

  async function handleTranslate() {
    if (translating) return;

    if (translated) {
      setArticles(originalArticles);
      setTranslated(false);
      return;
    }

    setTranslating(true);
    const texts = articles.flatMap((a) => [a.title, a.excerpt]);
    const result = await translateTexts(texts, "ko");

    const updated = articles.map((a, i) => ({
      ...a,
      title: result[i * 2] || a.title,
      excerpt: result[i * 2 + 1] || a.excerpt,
    }));
    setArticles(updated);
    setTranslated(true);
    setTranslating(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-[1200px] mx-auto px-3 md:px-4 py-5 md:py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <nav className="text-xs text-muted-foreground mb-1">
              <a href="/" className="hover:text-primary transition-colors">홈</a>
              <span className="mx-1.5">/</span>
              <span className="text-foreground font-medium">해외 뉴스</span>
            </nav>
            <h1 className="font-headline text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
              <Globe className="h-7 w-7 text-primary" />
              해외 뉴스
            </h1>
            <p className="text-sm text-muted-foreground mt-1">전 세계 주요 뉴스를 실시간으로 확인하세요</p>
          </div>
          <TranslateButton
            translated={translated}
            translating={translating}
            targetLabel="한국어 번역"
            onToggle={handleTranslate}
          />
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
                  {articles[0].thumbnail && (
                    <img
                      src={articles[0].thumbnail}
                      alt={articles[0].title}
                      className="w-full md:w-1/2 h-48 md:h-64 object-cover"
                    />
                  )}
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

            <InlineAd slot="9121339058" className="mb-6" />

            {/* Article grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {articles.slice(1).map((article, i) => (
                <Card key={i} className="border-0 shadow-sm hover:shadow-md transition-shadow py-0 gap-0">
                  <a href={articleLink(article.url, article.title, article.publisher.name)} className="block">
                    {article.thumbnail && (
                      <img
                        src={article.thumbnail}
                        alt={article.title}
                        className="w-full h-40 object-cover rounded-t-lg"
                        loading="lazy"
                      />
                    )}
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

            <InlineAd slot="2248808942" className="mt-6" />
          </>
        )}
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
}
