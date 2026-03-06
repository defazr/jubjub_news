"use client";

import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { isBookmarked, toggleBookmark } from "@/lib/storage";
import type { ApiArticle } from "@/lib/api";

interface Props {
  article: ApiArticle;
  className?: string;
}

export default function BookmarkButton({ article, className = "" }: Props) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isBookmarked(article.url));
  }, [article.url]);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const result = toggleBookmark({
      url: article.url,
      title: article.title,
      excerpt: article.excerpt,
      thumbnail: article.thumbnail,
      publisher: article.publisher.name,
      date: article.date,
      savedAt: Date.now(),
    });
    setSaved(result);
  }

  return (
    <button
      onClick={handleClick}
      className={`p-1.5 rounded-full hover:bg-accent transition-colors ${className}`}
      title={saved ? "스크랩 취소" : "스크랩"}
    >
      <Bookmark
        className={`h-4 w-4 transition-colors ${
          saved ? "fill-primary text-primary" : "text-muted-foreground hover:text-foreground"
        }`}
      />
    </button>
  );
}
