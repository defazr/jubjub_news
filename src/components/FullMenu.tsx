"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { X, Search, Home, Sparkles, TrendingUp, Bookmark, Globe, Clock, Sun, Moon, Newspaper } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { getSearchHistory, addSearchHistory, removeSearchHistoryItem, clearSearchHistory } from "@/lib/storage";

interface Props {
  open: boolean;
  onClose: () => void;
}

// News-style menu order: Home, Trending, AI, then categories by priority
const MENU_CATEGORIES = [
  { label: "Technology", slug: "tech" },
  { label: "Economy", slug: "economy" },
  { label: "Politics", slug: "politics" },
  { label: "World", slug: "world" },
  { label: "Opinion", slug: "opinion" },
  { label: "Culture", slug: "culture" },
  { label: "Sports", slug: "sports" },
  { label: "Society", slug: "society" },
];

export default function FullMenu({ open, onClose }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Body scroll lock
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setSearchHistory(getSearchHistory());
      setTimeout(() => inputRef.current?.focus(), 200);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      window.addEventListener("keydown", handleKey);
      return () => window.removeEventListener("keydown", handleKey);
    }
  }, [open, onClose]);

  function doSearch(query: string) {
    const trimmed = query.trim();
    if (!trimmed) return;
    addSearchHistory(trimmed);
    window.location.href = `/search?q=${encodeURIComponent(trimmed)}`;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    doSearch(searchQuery);
  }

  function handleRemoveHistory(e: React.MouseEvent, query: string) {
    e.stopPropagation();
    removeSearchHistoryItem(query);
    setSearchHistory(getSearchHistory());
  }

  if (!open) return null;

  const filteredHistory = searchQuery.trim()
    ? searchHistory.filter((h) => h.toLowerCase().includes(searchQuery.toLowerCase()))
    : searchHistory;

  // Find category color by slug
  function getCatColor(slug: string): string {
    return CATEGORIES.find((c) => c.slug === slug)?.color || "#888";
  }

  return (
    <div className="fixed inset-0 z-[100] bg-background/98 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="h-full overflow-y-auto"
        style={{ overscrollBehavior: "contain" }}
      >
        <div className="max-w-[600px] mx-auto px-5 py-4">
          {/* Top: close + logo */}
          <div className="flex items-center justify-between mb-6">
            <a href="/" className="font-headline text-xl tracking-tight" onClick={onClose}>
              Headlines Fazr
            </a>
            <button
              onClick={onClose}
              className="p-2 -mr-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search */}
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowHistory(true);
                }}
                onFocus={() => setShowHistory(true)}
                placeholder="Search news..."
                className="w-full h-11 pl-10 pr-4 rounded-lg border border-input bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-background transition-colors"
              />
            </div>

            {showHistory && filteredHistory.length > 0 && (
              <div className="mt-2 bg-card border border-border rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                  <span className="text-xs text-muted-foreground font-medium">Recent</span>
                  <button
                    type="button"
                    onClick={() => {
                      clearSearchHistory();
                      setSearchHistory([]);
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                </div>
                {filteredHistory.slice(0, 5).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => doSearch(item)}
                    className="flex items-center justify-between w-full px-3 py-2.5 text-sm hover:bg-accent transition-colors text-left"
                  >
                    <span className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      {item}
                    </span>
                    <span
                      role="button"
                      onClick={(e) => handleRemoveHistory(e, item)}
                      className="p-0.5 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </span>
                  </button>
                ))}
              </div>
            )}
          </form>

          {/* Main navigation - news style order */}
          <div className="border border-border rounded-lg overflow-hidden divide-y divide-border mb-4">
            <a href="/" onClick={onClose} className="flex items-center gap-3 px-4 py-3.5 text-base font-medium hover:bg-accent transition-colors">
              <Home className="h-4 w-4 shrink-0" />
              Home
            </a>
            <a href="/trending" onClick={onClose} className="flex items-center gap-3 px-4 py-3.5 text-base font-medium text-primary hover:bg-accent transition-colors">
              <TrendingUp className="h-4 w-4 shrink-0" />
              Trending
            </a>
            <a href="/ai" onClick={onClose} className="flex items-center gap-3 px-4 py-3.5 text-base font-medium text-primary hover:bg-accent transition-colors">
              <Sparkles className="h-4 w-4 shrink-0" />
              AI News
            </a>
            <a href="/world" onClick={onClose} className="flex items-center gap-3 px-4 py-3.5 text-base font-medium hover:bg-accent transition-colors">
              <Globe className="h-4 w-4 shrink-0" />
              World News
            </a>
            <a href="/digest" onClick={onClose} className="flex items-center gap-3 px-4 py-3.5 text-base font-medium hover:bg-accent transition-colors">
              <Newspaper className="h-4 w-4 shrink-0" />
              Daily Digest
            </a>
          </div>

          {/* Sections - categories in news-style order */}
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
            Sections
          </h3>
          <div className="border border-border rounded-lg overflow-hidden divide-y divide-border mb-4">
            {MENU_CATEGORIES.map((cat) => (
              <a
                key={cat.slug}
                href={`/topic/${cat.slug}`}
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3.5 text-base font-medium hover:bg-accent transition-colors"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: getCatColor(cat.slug) }}
                />
                {cat.label}
              </a>
            ))}
          </div>

          {/* Utilities: Saved + Theme (moved from header) */}
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
            Settings
          </h3>
          <div className="border border-border rounded-lg overflow-hidden divide-y divide-border mb-4">
            <a href="/bookmarks" onClick={onClose} className="flex items-center gap-3 px-4 py-3.5 text-base font-medium hover:bg-accent transition-colors">
              <Bookmark className="h-4 w-4 shrink-0" />
              Saved Articles
            </a>
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex items-center gap-3 w-full px-4 py-3.5 text-base font-medium hover:bg-accent transition-colors text-left"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4 shrink-0" />
                ) : (
                  <Moon className="h-4 w-4 shrink-0" />
                )}
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </button>
            )}
          </div>

          {/* Bottom padding */}
          <div className="h-8" />
        </div>
      </div>
    </div>
  );
}
