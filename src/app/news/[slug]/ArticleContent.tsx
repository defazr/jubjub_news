"use client";

import { ExternalLink, Calendar, Building2, Tag, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import AdUnit from "@/components/AdUnit";
import BookmarkButton from "@/components/BookmarkButton";
import ShareButton from "@/components/ShareButton";
import type { Article } from "@/types/database";

interface Props {
  article: Article;
  relatedArticles: Article[];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default function ArticleContent({ article, relatedArticles }: Props) {
  const apiArticle = {
    title: article.title,
    url: article.source_url,
    excerpt: article.excerpt || "",
    thumbnail: article.image_url || "",
    language: "en",
    date: article.published_at || article.created_at,
    authors: [],
    publisher: {
      name: article.publisher || "",
      url: "",
      favicon: "",
    },
  };

  return (
    <article>
      {/* Back button */}
      <a
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        News Home
      </a>

      {/* Category badge */}
      <Badge variant="secondary" className="mb-3 capitalize">
        {article.category}
      </Badge>

      {/* Title */}
      <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-4">
        {article.title}
      </h1>

      {/* Meta info */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
        {article.publisher && (
          <span className="flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5" />
            {article.publisher}
          </span>
        )}
        {(article.published_at || article.created_at) && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(article.published_at || article.created_at)}
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 mb-6">
        <BookmarkButton article={apiArticle} />
        <ShareButton title={article.title} url={`/news/${article.slug}`} />
      </div>

      <Separator className="mb-6" />

      {/* Featured image */}
      {article.image_url && (
        <div className="mb-6 rounded-lg overflow-hidden">
          <img
            src={article.image_url}
            alt={article.title}
            className="w-full h-auto object-cover max-h-[400px]"
          />
        </div>
      )}

      {/* AI Summary */}
      {article.summary && (
        <div className="bg-primary/5 border border-primary/10 rounded-lg p-5 mb-6">
          <h2 className="text-sm font-semibold text-primary mb-2">AI Summary</h2>
          <p className="text-base leading-relaxed">{article.summary}</p>
        </div>
      )}

      {/* Excerpt / Content */}
      {article.excerpt && (
        <div className="prose prose-neutral dark:prose-invert max-w-none mb-6">
          <p className="text-base leading-relaxed">{article.excerpt}</p>
        </div>
      )}

      {/* Mid-article Ad */}
      <AdUnit slot="mid-article" className="my-6" />

      {/* Original link */}
      <div className="bg-muted/50 rounded-lg p-4 mb-6">
        <p className="text-sm text-muted-foreground mb-2">Original Article</p>
        <a
          href={article.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-primary hover:underline text-sm font-medium"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Read full article on {article.publisher || "source"}
        </a>
      </div>

      {/* Keywords */}
      {article.keywords && article.keywords.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <Tag className="h-4 w-4 text-muted-foreground" />
          {article.keywords.map((kw) => (
            <a key={kw} href={`/topic/${kw}`}>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                {kw}
              </Badge>
            </a>
          ))}
        </div>
      )}

      <Separator className="my-6" />

      {/* Related articles */}
      {relatedArticles.length > 0 && (
        <section>
          <h2 className="text-lg font-bold mb-4">Related News</h2>
          <div className="space-y-3">
            {relatedArticles.map((rel) => (
              <a key={rel.id} href={`/news/${rel.slug}`}>
                <Card className="p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                  <div className="flex gap-3">
                    {rel.image_url && (
                      <img
                        src={rel.image_url}
                        alt=""
                        className="w-20 h-14 object-cover rounded flex-shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium line-clamp-2">
                        {rel.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {rel.publisher && `${rel.publisher} · `}
                        {formatDate(rel.created_at)}
                      </p>
                    </div>
                  </div>
                </Card>
              </a>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
