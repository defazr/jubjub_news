"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  Menu,
  Sun,
  Moon,
  Home,
  Search,
  X,
} from "lucide-react";

const categories = [
  "정치", "경제", "사회", "국제", "문화", "IT/과학", "스포츠", "오피니언",
];

interface Props {
  onSearch?: (query: string) => void;
}

export default function Header({ onSearch }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [currentDate] = useState(() => {
    const now = new Date();
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    return `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 (${days[now.getDay()]})`;
  });

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 120);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleCategoryClick(cat: string) {
    setSheetOpen(false);
    const el = document.getElementById(`category-${cat}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim());
      setSearchOpen(false);
      setSearchQuery("");
    }
  }

  return (
    <>
      <header className="relative z-50">
        {/* Top info bar */}
        <div className="bg-muted/50 border-b border-border">
          <div className="max-w-[1200px] mx-auto px-4 py-1.5 flex justify-between items-center text-xs text-muted-foreground">
            <span>{currentDate}</span>
            <div className="flex items-center gap-3">
              <a href="#" className="hover:text-foreground transition-colors">로그인</a>
              <a href="#" className="hover:text-foreground transition-colors">회원가입</a>
              <a href="#" className="hidden sm:inline hover:text-foreground transition-colors">MY뉴스</a>
            </div>
          </div>
        </div>

        {/* Logo area - hides on scroll */}
        <div
          className={`bg-card border-b border-border transition-all duration-300 overflow-hidden ${
            scrolled ? "max-h-0 opacity-0" : "max-h-32 opacity-100"
          }`}
        >
          <div className="max-w-[1200px] mx-auto px-4 py-5 md:py-7 text-center">
            <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              JubJub 뉴스
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1.5">
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
              {/* Mobile: hamburger + logo */}
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
                      <h2 className="font-headline text-xl font-bold text-foreground">JubJub 뉴스</h2>
                      <p className="text-xs text-muted-foreground mt-1">국내외 주요 뉴스를 한눈에</p>
                    </div>
                    <div className="py-2">
                      <button
                        onClick={() => { setSheetOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        className="flex items-center gap-3 w-full px-5 py-3 text-sm font-medium hover:bg-accent transition-colors"
                      >
                        <Home className="h-4 w-4" /> 홈
                      </button>
                      <Separator />
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => handleCategoryClick(cat)}
                          className="flex items-center w-full px-5 py-3 text-sm hover:bg-accent transition-colors"
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Compact logo (shows when scrolled, visible on all screens) */}
              {scrolled && (
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="font-headline text-lg font-bold text-primary hover:opacity-80 transition-opacity hidden md:block"
                >
                  JubJub 뉴스
                </button>
              )}

              {/* Desktop nav links */}
              <ul className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
                <li>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="text-sm font-medium text-foreground/80 hover:text-primary hover:bg-primary/5"
                  >
                    <Home className="h-4 w-4 mr-1" />
                    홈
                  </Button>
                </li>
                {categories.map((cat) => (
                  <li key={cat}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCategoryClick(cat)}
                      className="text-sm font-medium text-foreground/80 hover:text-primary hover:bg-primary/5"
                    >
                      {cat}
                    </Button>
                  </li>
                ))}
              </ul>

              {/* Right actions */}
              <div className="flex items-center gap-1">
                {/* Search toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setSearchOpen(!searchOpen)}
                >
                  {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
                </Button>

                {/* Dark mode toggle */}
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

            {/* Search bar (expandable) */}
            {searchOpen && (
              <div className="pb-3 animate-slide-down">
                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="뉴스 검색..."
                    className="flex-1 h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    autoFocus
                  />
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
