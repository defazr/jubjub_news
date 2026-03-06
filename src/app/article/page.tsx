"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, useCallback } from "react";
import AdUnit from "@/components/AdUnit";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ExternalLink, X, Loader2 } from "lucide-react";
import { markAsRead } from "@/lib/storage";

const COUNTDOWN_SECONDS = 7;

function ArticleRedirectContent() {
  const params = useSearchParams();
  const url = params.get("url") || "";
  const title = params.get("title") || "뉴스 기사";
  const source = params.get("source") || "";
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [paused, setPaused] = useState(false);

  const goToArticle = useCallback(() => {
    if (url) window.location.href = url;
  }, [url]);

  // Mark article as read
  useEffect(() => {
    if (url) markAsRead(url);
  }, [url]);

  useEffect(() => {
    if (!url || paused) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = url;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [url, paused]);

  const handleSkip = () => {
    setPaused(true);
    setCountdown(0);
  };

  const progress = ((COUNTDOWN_SECONDS - countdown) / COUNTDOWN_SECONDS) * 100;

  if (!url) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="border-0 shadow-md max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">잘못된 접근입니다.</p>
            <Button asChild>
              <a href="/">홈으로 돌아가기</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-[800px] mx-auto px-4 py-3 flex items-center justify-between">
          <a
            href="/"
            className="hover:opacity-80 transition-opacity"
          >
            <img src="/icons/favicon.svg" alt="줍줍뉴스" className="h-7 w-7" />
          </a>
          <Button variant="ghost" size="sm" asChild>
            <a href="/" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              홈으로
            </a>
          </Button>
        </div>
        {/* Progress bar */}
        {countdown > 0 && !paused && (
          <div className="h-1 bg-muted">
            <div
              className="h-full bg-primary transition-all duration-1000 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </header>

      <main className="max-w-[800px] mx-auto px-4 py-8">
        {/* 상단 광고 */}
        <div className="mb-6">
          <p className="text-[10px] text-muted-foreground/50 text-center mb-1">광고</p>
          <AdUnit slot="9121339058" />
        </div>

        <Card className="border-0 shadow-sm mb-6">
          <CardContent className="p-6">
            <Badge variant="outline" className="mb-4 text-xs text-muted-foreground">
              <ExternalLink className="h-3 w-3 mr-1" />
              외부 기사로 이동합니다
            </Badge>

            <h1 className="font-headline text-xl md:text-2xl font-bold text-card-foreground mb-3 leading-tight">
              {decodeURIComponent(title)}
            </h1>

            {source && (
              <p className="text-sm text-muted-foreground mb-5">
                출처: <span className="font-medium text-card-foreground">{decodeURIComponent(source)}</span>
              </p>
            )}

            <Separator className="mb-5" />

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <a href={url} className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  기사 바로가기
                </a>
              </Button>

              {countdown > 0 && !paused ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {countdown}초 후 자동 이동
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSkip}
                    className="text-xs text-muted-foreground hover:text-foreground gap-1"
                  >
                    <X className="h-3.5 w-3.5" />
                    취소
                  </Button>
                </div>
              ) : paused ? (
                <span className="text-sm text-muted-foreground">
                  자동 이동이 취소되었습니다
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">이동 중...</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 중간 광고 */}
        <div className="mb-6">
          <p className="text-[10px] text-muted-foreground/50 text-center mb-1">광고</p>
          <AdUnit slot="2248808942" />
        </div>

        {/* 하단 광고 */}
        <div className="mb-6">
          <p className="text-[10px] text-muted-foreground/50 text-center mb-1">광고</p>
          <AdUnit slot="9121339058" format="rectangle" />
        </div>

        <div className="text-center">
          <Button variant="link" asChild className="text-muted-foreground">
            <a href="/">JubJub 뉴스 홈으로 돌아가기</a>
          </Button>
        </div>
      </main>

      <footer className="bg-card border-t border-border text-muted-foreground/60 text-xs text-center py-4 mt-8">
        &copy; 2026 줍줍뉴스. All rights reserved.
      </footer>
    </div>
  );
}

export default function ArticlePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="border-0 shadow-sm max-w-md w-full mx-4">
            <CardContent className="p-8 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-40" />
            </CardContent>
          </Card>
        </div>
      }
    >
      <ArticleRedirectContent />
    </Suspense>
  );
}
