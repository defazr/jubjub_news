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
  Home,
  Search,
  X,
  Bookmark,
  Clock,
  Sparkles,
  TrendingUp,
  CloudSun,
  CloudRain,
  CloudSnow,
  Cloud,
  CloudLightning,
  CloudDrizzle,
  CloudFog,
} from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { getSearchHistory, addSearchHistory, removeSearchHistoryItem, clearSearchHistory, getFontSize, setFontSize as saveFontSize } from "@/lib/storage";

interface Props {
  onSearch?: (query: string) => void;
}

interface WeatherData {
  temp: string;
  icon: "sun" | "cloud" | "rain" | "snow" | "thunder" | "drizzle" | "fog" | "cloudsun";
  city: string;
}

const WEATHER_ICONS = {
  sun: Sun,
  cloud: Cloud,
  rain: CloudRain,
  snow: CloudSnow,
  thunder: CloudLightning,
  drizzle: CloudDrizzle,
  fog: CloudFog,
  cloudsun: CloudSun,
} as const;

function mapWeatherCode(code: number): WeatherData["icon"] {
  if (code === 0 || code === 1) return "sun";
  if (code === 2) return "cloudsun";
  if (code === 3) return "cloud";
  if (code >= 51 && code <= 57) return "drizzle";
  if (code >= 61 && code <= 67) return "rain";
  if (code >= 71 && code <= 77) return "snow";
  if (code >= 80 && code <= 82) return "rain";
  if (code >= 85 && code <= 86) return "snow";
  if (code >= 95) return "thunder";
  if (code === 45 || code === 48) return "fog";
  return "cloud";
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
  const [currentDate, setCurrentDate] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    setMounted(true);
    setFontSizeState(getFontSize());

    const now = new Date();
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    setCurrentDate(`${now.getMonth() + 1}/${now.getDate()} (${days[now.getDay()]})`);

    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled((prev) => {
        if (!prev && y > 60) return true;
        if (prev && y < 30) return false;
        return prev;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Fetch weather using Open-Meteo (free, no API key)
    fetchWeather();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  async function fetchWeather() {
    try {
      // Default: Seoul. Try geolocation first.
      let lat = 37.5665;
      let lon = 126.978;
      let city = "Seoul";

      if (navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 })
          );
          lat = pos.coords.latitude;
          lon = pos.coords.longitude;
          city = "";
        } catch {
          // Use default Seoul
        }
      }

      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`
      );
      if (!res.ok) return;
      const data = await res.json();
      const temp = Math.round(data.current.temperature_2m);
      const code = data.current.weather_code;

      // Reverse geocode city name if we used geolocation
      if (!city) {
        try {
          const geoRes = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?latitude=${lat}&longitude=${lon}&count=1&format=json&name=${lat.toFixed(1)}`
          );
          // Fallback: just show temp without city
          city = "";
        } catch {
          city = "";
        }
      }

      setWeather({
        temp: `${temp}°`,
        icon: mapWeatherCode(code),
        city,
      });
    } catch {
      // Weather fetch failed silently
    }
  }

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

  const WeatherIcon = weather ? WEATHER_ICONS[weather.icon] : null;

  return (
    <>
      <header className="relative z-50">
        {/* Top bar: Logo + Date/Weather */}
        <div
          className={`bg-card border-b border-border transition-all duration-300 ${
            scrolled ? "hidden" : ""
          }`}
        >
          <div className="max-w-[1200px] mx-auto px-4 h-14 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="font-headline text-xl md:text-2xl tracking-tight">Headlines Fazr</span>
            </a>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {mounted && weather && WeatherIcon && (
                <span className="flex items-center gap-1">
                  <WeatherIcon className="h-3.5 w-3.5 text-primary/70" />
                  <span className="font-medium text-foreground/70">{weather.temp}</span>
                </span>
              )}
              {mounted && currentDate && (
                <span>{currentDate}</span>
              )}
            </div>
          </div>
        </div>

        {/* Sticky navigation bar */}
        <nav
          className={`bg-card/95 backdrop-blur-md border-b border-border transition-shadow duration-300 ${
            scrolled ? "fixed top-0 left-0 right-0 shadow-md" : ""
          }`}
        >
          <div className="max-w-[1200px] mx-auto px-4">
            <div className="flex items-center justify-between h-11">
              {/* Mobile: hamburger */}
              <div className="flex md:hidden items-center">
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-72 p-0">
                    <SheetTitle className="sr-only">메뉴</SheetTitle>
                    <div className="p-5 border-b border-border">
                      <span className="font-headline text-xl tracking-tight">Headlines Fazr</span>
                      <p className="text-xs text-muted-foreground mt-1">Global News Curated by AI</p>
                    </div>
                    <div className="py-2">
                      <a
                        href="/"
                        className="flex items-center gap-3 w-full px-5 py-3 text-sm font-medium hover:bg-accent transition-colors"
                      >
                        <Home className="h-4 w-4" /> Home
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
                        <Bookmark className="h-4 w-4" /> Saved
                      </a>
                      <a
                        href="/ai"
                        className="flex items-center gap-3 w-full px-5 py-3 text-sm font-medium text-primary hover:bg-accent transition-colors"
                      >
                        <Sparkles className="h-4 w-4" /> AI News
                      </a>
                      <a
                        href="/trending"
                        className="flex items-center gap-3 w-full px-5 py-3 text-sm font-medium text-primary hover:bg-accent transition-colors"
                      >
                        <TrendingUp className="h-4 w-4" /> Trending
                      </a>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Compact logo (shows when scrolled) */}
              {scrolled && (
                <a
                  href="/"
                  className="hover:opacity-80 transition-opacity hidden md:flex items-center gap-2"
                >
                  <span className="font-headline text-lg tracking-tight">Headlines Fazr</span>
                  {mounted && weather && WeatherIcon && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground ml-1">
                      <WeatherIcon className="h-3 w-3 text-primary/70" />
                      <span className="text-foreground/70">{weather.temp}</span>
                    </span>
                  )}
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
                      Home
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
                    <a href="/trending">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Trending
                    </a>
                  </Button>
                </li>
              </ul>

              {/* Right actions */}
              <div className="flex items-center gap-0.5">
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
                      placeholder="Search news..."
                      className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      autoFocus
                    />

                    {/* Search history dropdown */}
                    {showHistory && filteredHistory.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-50 overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                          <span className="text-xs text-muted-foreground font-medium">Recent searches</span>
                          <button
                            type="button"
                            onClick={handleClearHistory}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            Clear all
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
                    Search
                  </Button>
                </form>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* Spacer when nav is fixed */}
      {scrolled && <div className="h-11" />}
    </>
  );
}
