"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BookmarkButton from "@/components/BookmarkButton";
import type { Article } from "@/types/database";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default function AiArticleList({ articles }: { articles: Article[] }) {
  if (articles.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        AI 요약 기사가 아직 없습니다. 뉴스 수집이 진행되면 자동으로 표시됩니다.
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      {articles.map((article) => (
        <Card key={article.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <div className="flex flex-col md:flex-row">
            {article.image_url && (
              <a href={`/news/${article.slug}`} className="md:w-60 shrink-0">
                <img
                  src={article.image_url}
                  alt=""
                  className="w-full h-44 md:h-full object-cover"
                />
              </a>
            )}
            <div className="p-4 flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize text-xs">
                    {article.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs text-primary border-primary/30">
                    AI 요약
                  </Badge>
                </div>
                <BookmarkButton
                  article={{
                    title: article.title,
                    url: article.source_url,
                    excerpt: article.excerpt || "",
                    thumbnail: article.image_url || "",
                    language: "ko",
                    date: article.published_at || article.created_at,
                    authors: [],
                    publisher: { name: article.publisher || "", url: "", favicon: "" },
                  }}
                />
              </div>
              <a href={`/news/${article.slug}`}>
                <h2 className="text-base font-semibold line-clamp-2 mb-2 hover:text-primary transition-colors">
                  {article.title}
                </h2>
              </a>
              {article.summary && (
                <p className="text-sm text-muted-foreground line-clamp-3 mb-3 leading-relaxed">
                  {article.summary}
                </p>
              )}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {article.publisher && `${article.publisher} · `}
                  {formatDate(article.created_at)}
                </span>
                {article.keywords && article.keywords.length > 0 && (
                  <div className="hidden sm:flex gap-1">
                    {article.keywords.slice(0, 3).map((kw) => (
                      <a
                        key={kw}
                        href={`/topic/${encodeURIComponent(kw)}`}
                        className="text-primary/70 hover:text-primary"
                      >
                        #{kw}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
