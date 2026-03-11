"use client";

import { useEffect, useState } from "react";
import { type ApiArticle } from "@/lib/api";
import { articleLink } from "@/lib/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Globe } from "lucide-react";
import BookmarkButton from "@/components/BookmarkButton";
import ShareButton from "@/components/ShareButton";
import { getReadUrls } from "@/lib/storage";

interface Props {
  articles: ApiArticle[];
}

export default function Sidebar({ articles }: Props) {
  const [readUrls, setReadUrls] = useState<Set<string>>(new Set());

  useEffect(() => {
    setReadUrls(getReadUrls());
  }, []);

  return (
    <aside className="space-y-5 lg:sticky lg:top-16">
      {/* Most read */}
      <Card className="border-0 shadow-sm overflow-hidden py-0 gap-0">
        <CardHeader className="bg-primary/5 dark:bg-primary/10 pt-4 pb-3 px-4">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Trending
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <ol className="space-y-3.5">
            {articles.slice(0, 8).map((article, i) => (
              <li key={i} className="flex gap-2.5 items-start group">
                <Badge
                  variant={i < 3 ? "default" : "secondary"}
                  className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center p-0 text-sm font-bold ${
                    i < 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </Badge>
                <a
                  href={articleLink(article.url, article.title, article.publisher.name)}
                  className={`flex-1 text-[15px] text-card-foreground group-hover:text-primary leading-snug transition-colors line-clamp-2 ${readUrls.has(article.url) ? "opacity-60" : ""}`}
                >
                  {article.title}
                </a>
                <ShareButton url={article.url} title={article.title} className="shrink-0" />
                <BookmarkButton article={article} className="shrink-0 p-1" />
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Publisher sources */}
      <Card className="border-0 shadow-sm py-0 gap-0">
        <CardHeader className="pt-4 pb-3 px-4">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            Sources
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {[...new Set(articles.map((a) => a.publisher.name).filter(Boolean))]
              .slice(0, 8)
              .map((name, i) => (
                <Badge key={i} variant="outline" className="text-xs font-normal max-w-[200px] truncate">
                  {name}
                </Badge>
              ))}
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
