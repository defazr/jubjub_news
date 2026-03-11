"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";

const FALLBACK_KEYWORDS = [
  "AI", "Nvidia", "Tesla", "OpenAI", "Bitcoin", "Apple", "Microsoft",
  "Google", "Samsung", "ChatGPT", "DeepSeek", "Anthropic",
];

const CACHE_KEY = "hf_trending_cache";
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export default function TrendingBar() {
  const [keywords, setKeywords] = useState<string[]>([]);

  useEffect(() => {
    // Try cache first
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const { data, ts } = JSON.parse(raw);
        if (Date.now() - ts < CACHE_TTL && data?.length) {
          setKeywords(data);
          return;
        }
      }
    } catch {
      // ignore
    }

    fetchTrending();
  }, []);

  async function fetchTrending() {
    try {
      const res = await fetch("/api/trending-keywords");
      if (res.ok) {
        const data = await res.json();
        if (data.keywords?.length) {
          setKeywords(data.keywords.slice(0, 15));
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ data: data.keywords.slice(0, 15), ts: Date.now() })
          );
          return;
        }
      }
    } catch {
      // fallback
    }
    setKeywords(FALLBACK_KEYWORDS);
  }

  if (!keywords.length) return null;

  return (
    <div className="bg-card border-b border-border">
      <div className="max-w-[1200px] mx-auto px-4 h-8 flex items-center gap-3 overflow-hidden">
        <span className="flex items-center gap-1 text-xs font-semibold text-orange-500 shrink-0">
          <Flame className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Trending</span>
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
          {keywords.map((kw) => (
            <a
              key={kw}
              href={`/topic/${encodeURIComponent(kw.toLowerCase())}`}
              className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            >
              {kw}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
