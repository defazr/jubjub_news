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
import { searchNews, translateTexts, formatDate, type ApiArticle } from "@/lib/api";
import { CATEGORIES, type CategoryInfo } from "@/lib/categories";
import { articleLink } from "@/lib/link";

function InlineAd({ slot, className = "" }: { slot: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-[10px] text-muted-foreground/50 text-center mb-1">광고</p>
      <AdUnit slot={slot} />
    </div>
  );
}

interface Props {
  category: CategoryInfo;
}

export default function CategoryPageContent({ category }: Props) {
  const [articles, setArticles] = useState<ApiArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [translated, setTranslated] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [originalArticles, setOriginalArticles] = useState<ApiArticle[]>([]);

  useEffect(() => {
    document.title = `${category.name} - JubJub 뉴스`;
    async function load() {
      const data = await searchNews(category.query);
      setArticles(data);
      setOriginalArticles(data);
      setLoading(false);
    }
    load();
  }, [category]);

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

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-[1200px] mx-auto px-3 md:px-4 py-5 md:py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <nav className="text-xs text-muted-foreground mb-1">
              <a href="/" className="hover:text-primary transition-colors">홈</a>
              <span className="mx-1.5">/</span>
              <span className="text-foreground font-medium">{category.name}</span>
            </nav>
            <h1 className="font-headline text-2xl md:text-3xl font-bold text-foreground">
              {category.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
          </div>
          <TranslateButton
            translated={translated}
            translating={translating}
            targetLabel="English"
            onToggle={handleTranslate}
          />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

            <div className="mt-8">
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-primary rounded-full" />
                다른 카테고리
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
                    해외 뉴스
                  </Badge>
                </a>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
}
