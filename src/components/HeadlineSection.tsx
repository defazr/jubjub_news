"use client";

import { useEffect, useState } from "react";
import { type ApiArticle, formatDate } from "@/lib/api";
import { articleLink } from "@/lib/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import BookmarkButton from "@/components/BookmarkButton";
import ShareButton from "@/components/ShareButton";
import SafeImage from "@/components/SafeImage";
import { getReadUrls } from "@/lib/storage";

interface Props {
  articles: ApiArticle[];
}

export default function HeadlineSection({ articles }: Props) {
  const [readUrls, setReadUrls] = useState<Set<string>>(new Set());

  useEffect(() => {
    setReadUrls(getReadUrls());
  }, []);

  if (articles.length === 0) return null;

  const mainHeadline = articles[0];
  const subHeadline = articles[1];

  return (
    <section className="mb-6 md:mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
        {/* Main headline */}
        <Card className="md:col-span-2 overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow duration-300 py-0">
          <a href={articleLink(mainHeadline.url, mainHeadline.title, mainHeadline.publisher.name)} className="block">
            <div className="relative">
              <SafeImage
                src={mainHeadline.thumbnail}
                alt={mainHeadline.title}
                className="w-full h-48 md:h-56 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                <Badge variant="secondary" className="mb-2 bg-primary text-primary-foreground border-0 text-xs">
                  {mainHeadline.publisher.name || "News"}
                </Badge>
                <h2 className={`font-headline text-2xl md:text-3xl font-bold text-white leading-tight line-clamp-2 ${readUrls.has(mainHeadline.url) ? "opacity-70" : ""}`}>
                  {mainHeadline.title}
                  {readUrls.has(mainHeadline.url) && <span className="ml-2 text-xs font-normal bg-white/20 text-white/80 px-1.5 py-0.5 rounded align-middle">Read</span>}
                </h2>
              </div>
            </div>
          </a>
          <CardContent className="p-4 md:p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="text-muted-foreground text-base leading-relaxed line-clamp-2">
                  {mainHeadline.excerpt}
                </p>
                <p className="text-sm text-muted-foreground/70 mt-3">
                  {mainHeadline.authors?.[0] || mainHeadline.publisher.name} · {formatDate(mainHeadline.date)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <ShareButton url={mainHeadline.url} title={mainHeadline.title} />
                <BookmarkButton article={mainHeadline} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="space-y-5">
          {/* Sub headline */}
          {subHeadline && (
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden py-0">
              <a href={articleLink(subHeadline.url, subHeadline.title, subHeadline.publisher.name)} className="block">
                <SafeImage
                  src={subHeadline.thumbnail}
                  alt={subHeadline.title}
                  className="w-full h-32 object-cover"
                />
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <Badge variant="outline" className="mb-2 text-xs text-primary border-primary/30">
                        {subHeadline.publisher.name || "News"}
                      </Badge>
                      <h3 className={`font-headline text-lg md:text-xl font-bold text-card-foreground leading-snug line-clamp-2 hover:text-primary transition-colors ${readUrls.has(subHeadline.url) ? "opacity-60" : ""}`}>
                        {subHeadline.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {subHeadline.excerpt}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 mt-5">
                      <ShareButton url={subHeadline.url} title={subHeadline.title} />
                      <BookmarkButton article={subHeadline} />
                    </div>
                  </div>
                </CardContent>
              </a>
            </Card>
          )}

          {/* Numbered list */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <h4 className="text-base font-bold text-card-foreground mb-3 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-primary rounded-full" />
                Top Stories
              </h4>
              <Separator className="mb-3" />
              <ul className="space-y-3">
                {articles.slice(2, 7).map((article, i) => (
                  <li key={i} className="flex gap-2.5 text-[15px] group items-center">
                    <span className={`font-bold shrink-0 w-6 text-center text-lg ${
                      i < 3 ? "text-primary" : "text-muted-foreground/50"
                    }`}>
                      {i + 1}
                    </span>
                    <a
                      href={articleLink(article.url, article.title, article.publisher.name)}
                      className={`flex-1 text-card-foreground group-hover:text-primary line-clamp-1 transition-colors leading-snug ${readUrls.has(article.url) ? "opacity-60" : ""}`}
                    >
                      {article.title}
                    </a>
                    <ShareButton url={article.url} title={article.title} className="shrink-0" />
                    <BookmarkButton article={article} className="shrink-0 p-1" />
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
