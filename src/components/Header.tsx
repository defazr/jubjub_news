"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  Menu,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Home,
  Search,
  X,
  Globe,
  Bookmark,
  Clock,
  AArrowUp,
  AArrowDown,
  Sparkles,
} from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { getSearchHistory, addSearchHistory, removeSearchHistoryItem, clearSearchHistory, getFontSize, setFontSize as saveFontSize } from "@/lib/storage";

interface Props {
  onSearch?: (query: string) => void;
}

export default function Header({ onSearch }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [fontSize, setFontSizeState] = useState(16);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [currentDate] = useState(() => {
    const now = new Date();
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    return `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 (${days[now.getDay()]})`;
  });
  const [timeOfDay] = useState<"morning" | "afternoon" | "evening" | "night">(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 20) return "evening";
    return "night";
  });

  const timeMeta = {
    morning: { label: "좋은 아침", Icon: Sunrise },
    afternoon: { label: "좋은 오후", Icon: Sun },
    evening: { label: "좋은 저녁", Icon: Sunset },
    night: { label: "좋은 밤", Icon: Moon },
  } as const;
  const { label: timeLabel, Icon: TimeIcon } = timeMeta[timeOfDay];

  useEffect(() => {
    setMounted(true);
    setFontSizeState(getFontSize());
    const handleScroll = () => setScrolled(window.scrollY > 120);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function changeFontSize(delta: number) {
    const newSize = Math.max(12, Math.min(22, fontSize + delta));
    setFontSizeState(newSize);
    saveFontSize(newSize);
    document.documentElement.style.setProperty("--jubjub-font-size", `${newSize}px`);
  }

  useEffect(() => {
    if (searchOpen) {
      setSearchHistory(getSearchHistory());
    }
  }, [searchOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowHistory(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function doSearch(query: string) {
    const trimmed = query.trim();
    if (!trimmed) return;
    addSearchHistory(trimmed);
    if (onSearch) {
      onSearch(trimmed);
    } else {
      window.location.href = `/search?q=${encodeURIComponent(trimmed)}`;
    }
    setSearchOpen(false);
    setSearchQuery("");
    setShowHistory(false);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    doSearch(searchQuery);
  }

  function handleHistoryClick(query: string) {
    setSearchQuery(query);
    doSearch(query);
  }

  function handleRemoveHistory(e: React.MouseEvent, query: string) {
    e.stopPropagation();
    removeSearchHistoryItem(query);
    setSearchHistory(getSearchHistory());
  }

  function handleClearHistory() {
    clearSearchHistory();
    setSearchHistory([]);
  }

  const filteredHistory = searchQuery.trim()
    ? searchHistory.filter((h) => h.toLowerCase().includes(searchQuery.toLowerCase()))
    : searchHistory;

  return (
    <>
      <header className="relative z-50">
        {/* Top info bar */}
        <div className="bg-muted/50 border-b border-border">
          <div className="max-w-[1200px] mx-auto px-4 py-1.5 flex justify-between items-center text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span>{currentDate}</span>
              <span className="hidden sm:flex items-center gap-1 text-primary/70">
                <TimeIcon className="h-3 w-3" />
                {timeLabel}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <a href="/bookmarks" className="hover:text-primary transition-colors flex items-center gap-1">
                <Bookmark className="h-3 w-3" />
                스크랩
              </a>
              <a href="/ai" className="hover:text-primary transition-colors flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                AI 뉴스
              </a>
              <a href="/world" className="hover:text-primary transition-colors flex items-center gap-1">
                <Globe className="h-3 w-3" />
                해외 뉴스
              </a>
              <span className="flex items-center gap-0.5 border-l border-border pl-3">
                <button onClick={() => changeFontSize(-1)} className="hover:text-foreground transition-colors p-0.5" title="글자 줄이기">
                  <AArrowDown className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => changeFontSize(1)} className="hover:text-foreground transition-colors p-0.5" title="글자 키우기">
                  <AArrowUp className="h-3.5 w-3.5" />
                </button>
              </span>
            </div>
          </div>
        </div>

        {/* Logo area - hides on scroll */}
        <div
          className={`bg-card border-b border-border transition-all duration-300 overflow-hidden ${
            scrolled ? "max-h-0 opacity-0" : "max-h-32 opacity-100"
          }`}
        >
          <div className="max-w-[1200px] mx-auto px-4 py-4 md:py-6 text-center">
            <a href="/" className="inline-block">
              <h1 className="font-headline text-3xl md:text-4xl tracking-tight">
                JubJub 뉴스
              </h1>
            </a>
            <p className="text-sm md:text-base text-muted-foreground mt-1.5">
              국내외 주요 뉴스를 한눈에
            </p>
          </div>
        </div>

        {/* Sticky navigation bar */}
        <nav
          className={`bg-card/95 backdrop-blur-md border-b border-border transition-shadow duration-300 ${
            scrolled ? "fixed top-0 left-0 right-0 shadow-md" : ""
          }`}
        >
          <div className="max-w-[1200px] mx-auto px-4">
            <div className="flex items-center justify-between h-12">
              {/* Mobile: hamburger */}
              <div className="flex md:hidden items-center gap-2">
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-72 p-0">
                    <SheetTitle className="sr-only">메뉴</SheetTitle>
                    <div className="p-5 border-b border-border">
                      <span className="font-headline text-xl tracking-tight">JubJub 뉴스</span>
                      <p className="text-xs text-muted-foreground mt-1">국내외 주요 뉴스를 한눈에</p>
                    </div>
                    <div className="py-2">
                      <a
                        href="/"
                        className="flex items-center gap-3 w-full px-5 py-3 text-sm font-medium hover:bg-accent transition-colors"
                      >
                        <Home className="h-4 w-4" /> 홈
                      </a>
                      <Separator />
                      {CATEGORIES.map((cat) => (
                        <a
                          key={cat.slug}
                          href={`/category/${cat.slug}`}
                          className="flex items-center w-full px-5 py-3 text-sm hover:bg-accent transition-colors"
                        >
                          {cat.name}
                        </a>
                      ))}
                      <Separator />
                      <a
                        href="/bookmarks"
                        className="flex items-center gap-3 w-full px-5 py-3 text-sm font-medium hover:bg-accent transition-colors"
                      >
                        <Bookmark className="h-4 w-4" /> 스크랩
                      </a>
                      <a
                        href="/ai"
                        className="flex items-center gap-3 w-full px-5 py-3 text-sm font-medium text-primary hover:bg-accent transition-colors"
                      >
                        <Sparkles className="h-4 w-4" /> AI 뉴스
                      </a>
                      <a
                        href="/world"
                        className="flex items-center gap-3 w-full px-5 py-3 text-sm font-medium text-primary hover:bg-accent transition-colors"
                      >
                        <Globe className="h-4 w-4" /> 해외 뉴스
                      </a>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Compact logo (shows when scrolled) */}
              {scrolled && (
                <a
                  href="/"
                  className="hover:opacity-80 transition-opacity hidden md:block"
                >
                  <span className="font-headline text-lg tracking-tight">JubJub</span>
                </a>
              )}

              {/* Desktop nav links */}
              <ul className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
                <li>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-sm font-medium text-foreground/80 hover:text-primary hover:bg-primary/5"
                  >
                    <a href="/">
                      <Home className="h-4 w-4 mr-1" />
                      홈
                    </a>
                  </Button>
                </li>
                {CATEGORIES.map((cat) => (
                  <li key={cat.slug}>
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="text-sm font-medium text-foreground/80 hover:text-primary hover:bg-primary/5"
                    >
                      <a href={`/category/${cat.slug}`}>{cat.name}</a>
                    </Button>
                  </li>
                ))}
                <li>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-sm font-medium text-primary hover:bg-primary/5"
                  >
                    <a href="/ai">
                      <Sparkles className="h-4 w-4 mr-1" />
                      AI
                    </a>
                  </Button>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-sm font-medium text-primary hover:bg-primary/5"
                  >
                    <a href="/world">
                      <Globe className="h-4 w-4 mr-1" />
                      해외
                    </a>
                  </Button>
                </li>
              </ul>

              {/* Right actions */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setSearchOpen(!searchOpen)}
                >
                  {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  asChild
                >
                  <a href="/bookmarks">
                    <Bookmark className="h-4 w-4" />
                  </a>
                </Button>

                {mounted && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  >
                    {theme === "dark" ? (
                      <Sun className="h-4 w-4" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Search bar with autocomplete */}
            {searchOpen && (
              <div className="pb-3 animate-slide-down" ref={searchRef}>
                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowHistory(true);
                      }}
                      onFocus={() => setShowHistory(true)}
                      placeholder="뉴스 검색..."
                      className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      autoFocus
                    />

                    {/* Search history dropdown */}
                    {showHistory && filteredHistory.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-50 overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                          <span className="text-xs text-muted-foreground font-medium">최근 검색어</span>
                          <button
                            type="button"
                            onClick={handleClearHistory}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            전체 삭제
                          </button>
                        </div>
                        {filteredHistory.slice(0, 6).map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => handleHistoryClick(item)}
                            className="flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
                          >
                            <span className="flex items-center gap-2">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              {item}
                            </span>
                            <span
                              role="button"
                              onClick={(e) => handleRemoveHistory(e, item)}
                              className="p-0.5 hover:text-destructive transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button type="submit" size="sm" className="h-9">
                    검색
                  </Button>
                </form>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* Spacer when nav is fixed */}
      {scrolled && <div className="h-12" />}
    </>
  );
}
