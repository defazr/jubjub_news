"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Article } from "@/types/database";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default function TopicArticleList({ articles }: { articles: Article[] }) {
  if (articles.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No articles found for this topic.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <a key={article.id} href={`/news/${article.slug}`}>
          <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full">
            {article.image_url && (
              <img
                src={article.image_url}
                alt=""
                className="w-full h-40 object-cover"
              />
            )}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="capitalize text-xs">
                  {article.category}
                </Badge>
                {article.summary && (
                  <Badge variant="outline" className="text-xs text-primary border-primary/30">
                    AI Summary
                  </Badge>
                )}
              </div>
              <h2 className="text-sm font-semibold line-clamp-2 mb-2">
                {article.title}
              </h2>
              {article.summary ? (
                <p className="text-xs text-muted-foreground line-clamp-3 mb-2 leading-relaxed">
                  {article.summary}
                </p>
              ) : article.excerpt ? (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {article.excerpt}
                </p>
              ) : null}
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {article.publisher && `${article.publisher} · `}
                  {formatDate(article.created_at)}
                </p>
                {article.keywords && article.keywords.length > 0 && (
                  <div className="hidden sm:flex gap-1">
                    {article.keywords.slice(0, 2).map((kw) => (
                      <span key={kw} className="text-[10px] text-primary/70">
                        #{kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </a>
      ))}
    </div>
  );
}
