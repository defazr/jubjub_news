"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Bookmark, Trash2 } from "lucide-react";
import { getBookmarks, removeBookmark, type BookmarkedArticle } from "@/lib/storage";
import { articleLink } from "@/lib/link";

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkedArticle[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setBookmarks(getBookmarks());
  }, []);

  function handleRemove(url: string) {
    removeBookmark(url);
    setBookmarks(getBookmarks());
  }

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-[1200px] mx-auto px-3 md:px-4 py-5 md:py-8">
        <div className="mb-6">
          <nav className="text-xs text-muted-foreground mb-1">
            <a href="/" className="hover:text-primary transition-colors">홈</a>
            <span className="mx-1.5">/</span>
            <span className="text-foreground font-medium">스크랩</span>
          </nav>
          <h1 className="font-headline text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Bookmark className="h-7 w-7 text-primary" />
            스크랩한 기사
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {bookmarks.length}개의 기사
          </p>
        </div>

        <Separator className="mb-6" />

        {bookmarks.length === 0 ? (
          <div className="text-center py-16">
            <Bookmark className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg text-muted-foreground mb-2">
              스크랩한 기사가 없습니다
            </p>
            <p className="text-sm text-muted-foreground/60">
              기사의 북마크 아이콘을 눌러 스크랩하세요
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookmarks.map((article) => (
              <Card key={article.url} className="border-0 shadow-sm hover:shadow-md transition-shadow py-0 gap-0">
                <div className="sm:flex">
                  <a
                    href={articleLink(article.url, article.title, article.publisher)}
                    className="block sm:flex flex-1"
                  >
                    {article.thumbnail && (
                      <img
                        src={article.thumbnail}
                        alt={article.title}
                        className="w-full sm:w-48 h-32 sm:h-auto object-cover rounded-t-lg sm:rounded-t-none sm:rounded-l-lg shrink-0"
                        loading="lazy"
                      />
                    )}
                    <CardContent className="p-4 flex flex-col justify-center flex-1">
                      <Badge variant="outline" className="mb-1.5 w-fit text-xs text-primary border-primary/30">
                        {article.publisher}
                      </Badge>
                      <h3 className="text-base font-semibold text-card-foreground leading-snug mb-1 hover:text-primary transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {article.excerpt}
                      </p>
                    </CardContent>
                  </a>
                  <div className="flex items-center pr-4 pb-4 sm:pb-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemove(article.url)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
}
