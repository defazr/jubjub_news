"use client";

import { ExternalLink, Calendar, Building2, Tag, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import AdUnit from "@/components/AdUnit";
import BookmarkButton from "@/components/BookmarkButton";
import ShareButton from "@/components/ShareButton";
import SafeImage from "@/components/SafeImage";
import type { Article } from "@/types/database";
import { parseSummary } from "@/lib/articles";

interface Props {
  article: Article;
  relatedArticles: Article[];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  if (isNaN(then)) return "";
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `Updated ${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Updated ${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `Updated ${days}d ago`;
}

export default function ArticleContent({ article, relatedArticles }: Props) {
  const { seoHeadline, summaryText } = parseSummary(article.summary);

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

      {/* SEO Headline (if available) */}
      {seoHeadline && (
        <p className="text-sm font-medium text-primary mb-2">{seoHeadline}</p>
      )}

      {/* Title */}
      <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-4">
        {article.title}
      </h1>

      {/* Meta info + Updated timestamp */}
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
        {(article.published_at || article.created_at) && (
          <span className="text-xs text-muted-foreground/70">
            {timeAgo(article.published_at || article.created_at)}
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 mb-6">
        <BookmarkButton article={apiArticle} />
        <ShareButton title={article.title} url={`/news/${article.slug}`} />
      </div>

      <Separator className="mb-6" />

      {/* Featured image — 16:9 aspect ratio, min 1200px wide for Discover */}
      <div className="mb-6 rounded-lg overflow-hidden aspect-video">
        <SafeImage
          src={article.image_url}
          alt={article.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* AI Summary — Enhanced for Discover quality signal */}
      {(summaryText || article.summary) && (
        <div className="bg-primary/5 border border-primary/10 rounded-lg p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              AI Summary
            </span>
            <span className="text-[10px] text-muted-foreground">Powered by AI</span>
          </div>
          <p className="text-base leading-relaxed">{summaryText || article.summary}</p>
          {article.keywords && article.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-primary/10">
              <span className="text-[10px] text-muted-foreground mr-1">Key topics:</span>
              {article.keywords.slice(0, 5).map((kw) => (
                <a
                  key={kw}
                  href={`/topic/${encodeURIComponent(kw)}`}
                  className="text-[11px] font-medium text-primary hover:underline"
                >
                  {kw}
                </a>
              ))}
            </div>
          )}
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

      {/* More Topics — SEO internal linking */}
      {article.keywords && article.keywords.length > 0 && (
        <section className="bg-muted/50 rounded-lg p-4 mb-6">
          <h2 className="text-sm font-semibold mb-2">More Topics</h2>
          <div className="flex flex-wrap gap-2">
            {article.keywords.map((kw) => (
              <a
                key={kw}
                href={`/topic/${encodeURIComponent(kw)}`}
                className="text-sm text-primary hover:underline"
              >
                {kw}
              </a>
            ))}
          </div>
        </section>
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
                    <SafeImage
                      src={rel.image_url}
                      alt={rel.title}
                      className="w-20 h-14 object-cover rounded flex-shrink-0"
                    />
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
