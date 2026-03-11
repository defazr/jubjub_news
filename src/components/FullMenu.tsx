"use client";

import { useEffect, useRef, useState } from "react";
import { X, Search, Home, Sparkles, TrendingUp, Bookmark, Globe, Clock } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { getSearchHistory, addSearchHistory, removeSearchHistoryItem, clearSearchHistory } from "@/lib/storage";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function FullMenu({ open, onClose }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Body scroll lock
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setSearchHistory(getSearchHistory());
      // Focus search after animation
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

  const NAV_SECTIONS = [
    {
      items: [
        { label: "Home", href: "/", icon: Home },
        { label: "AI News", href: "/ai", icon: Sparkles, highlight: true },
        { label: "Trending", href: "/trending", icon: TrendingUp, highlight: true },
        { label: "World News", href: "/world", icon: Globe },
        { label: "Saved", href: "/bookmarks", icon: Bookmark },
      ],
    },
    {
      title: "Sections",
      items: CATEGORIES.map((cat) => ({
        label: cat.name,
        href: `/category/${cat.slug}`,
        color: cat.color,
      })),
    },
  ];

  const filteredHistory = searchQuery.trim()
    ? searchHistory.filter((h) => h.toLowerCase().includes(searchQuery.toLowerCase()))
    : searchHistory;

  return (
    <div
      className="fixed inset-0 z-[100] bg-background/98 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        ref={menuRef}
        className="h-full overflow-y-auto"
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

            {/* Search history */}
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

          {/* Navigation sections */}
          {NAV_SECTIONS.map((section, si) => (
            <div key={si} className="mb-4">
              {section.title && (
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                  {section.title}
                </h3>
              )}
              <div className="border border-border rounded-lg overflow-hidden divide-y divide-border">
                {section.items.map((item) => {
                  const Icon = "icon" in item ? item.icon : null;
                  const highlight = "highlight" in item && item.highlight;
                  const color = "color" in item ? item.color : undefined;

                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-4 py-3.5 text-base font-medium hover:bg-accent transition-colors ${
                        highlight ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {Icon && <Icon className="h-4.5 w-4.5 shrink-0" />}
                      {color && (
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        />
                      )}
                      {item.label}
                    </a>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Bottom padding for scroll */}
          <div className="h-8" />
        </div>
      </div>
    </div>
  );
}
