"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, Search } from "lucide-react";
import InfoBar from "@/components/InfoBar";
import TrendingBar from "@/components/TrendingBar";
import FullMenu from "@/components/FullMenu";
import { CATEGORIES } from "@/lib/categories";

interface Props {
  onSearch?: (query: string) => void;
}

export default function Header({ onSearch }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled((prev) => {
        if (!prev && y > 100) return true;
        if (prev && y < 50) return false;
        return prev;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header className="relative z-50">
        {/* Top Header: Logo + Search + Menu */}
        <div className={`bg-card border-b border-border ${scrolled ? "hidden" : ""}`}>
          <div className="max-w-[1200px] mx-auto px-4 h-14 flex items-center justify-between">
            <a href="/" className="hover:opacity-80 transition-opacity">
              <span className="font-headline text-xl md:text-2xl tracking-tight">
                Headlines Fazr
              </span>
            </a>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {CATEGORIES.slice(0, 6).map((cat) => (
                <a
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="text-xs font-medium text-muted-foreground hover:text-primary px-2 py-1 rounded transition-colors"
                >
                  {cat.name}
                </a>
              ))}
            </nav>

            {/* Right: Search + Menu only (Bloomberg style) */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => {
                  if (onSearch) {
                    onSearch("");
                  } else {
                    window.location.href = "/search";
                  }
                }}
              >
                <Search className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Info Bar: Weather, USD/KRW, BTC */}
        <div className={scrolled ? "hidden" : ""}>
          <InfoBar />
        </div>

        {/* Trending Bar */}
        <div className={scrolled ? "hidden" : ""}>
          <TrendingBar />
        </div>

        {/* Sticky compact bar (shows on scroll) */}
        {scrolled && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
            <div className="max-w-[1200px] mx-auto px-4 h-11 flex items-center justify-between">
              <a href="/" className="hover:opacity-80 transition-opacity">
                <span className="font-headline text-lg tracking-tight">Headlines Fazr</span>
              </a>

              <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
                {CATEGORIES.slice(0, 6).map((cat) => (
                  <a
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    className="text-xs font-medium text-muted-foreground hover:text-primary px-1.5 py-1 rounded transition-colors"
                  >
                    {cat.name}
                  </a>
                ))}
              </nav>

              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    if (onSearch) {
                      onSearch("");
                    } else {
                      window.location.href = "/search";
                    }
                  }}
                >
                  <Search className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setMenuOpen(true)}
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {scrolled && <div className="h-11" />}

      <FullMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
