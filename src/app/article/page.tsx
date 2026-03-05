"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import AdUnit from "@/components/AdUnit";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ExternalLink, Clock } from "lucide-react";

function ArticleRedirectContent() {
  const params = useSearchParams();
  const url = params.get("url") || "";
  const title = params.get("title") || "뉴스 기사";
  const source = params.get("source") || "";
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!url) return;
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
  }, [url]);

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
            className="font-headline text-lg font-bold text-primary hover:opacity-80 transition-opacity"
          >
            JubJub 뉴스
          </a>
          <Button variant="ghost" size="sm" asChild>
            <a href="/" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              홈으로
            </a>
          </Button>
        </div>
      </header>

      <main className="max-w-[800px] mx-auto px-4 py-8">
        <AdUnit slot="9121339058" className="mb-6" />

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
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {countdown > 0
                  ? `${countdown}초 후 자동으로 이동합니다`
                  : "이동 중..."}
              </span>
            </div>
          </CardContent>
        </Card>

        <AdUnit slot="2248808942" className="mb-6" />

        <div className="text-center">
          <Button variant="link" asChild className="text-muted-foreground">
            <a href="/">JubJub 뉴스 홈으로 돌아가기</a>
          </Button>
        </div>
      </main>

      <footer className="bg-card border-t border-border text-muted-foreground/60 text-xs text-center py-4 mt-8">
        &copy; 2026 JubJub 뉴스. All rights reserved.
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
