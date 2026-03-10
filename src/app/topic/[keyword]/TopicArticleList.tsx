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
        이 토픽에 해당하는 기사가 없습니다.
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
              <Badge variant="secondary" className="mb-2 capitalize text-xs">
                {article.category}
              </Badge>
              <h2 className="text-sm font-semibold line-clamp-2 mb-2">
                {article.title}
              </h2>
              {article.excerpt && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {article.excerpt}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {article.publisher && `${article.publisher} · `}
                {formatDate(article.created_at)}
              </p>
            </div>
          </Card>
        </a>
      ))}
    </div>
  );
}
