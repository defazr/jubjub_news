"use client";

import { useState, useEffect } from "react";
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
  CloudFog,
  CloudSun,
  DollarSign,
  Bitcoin,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface MarketData {
  weather: { temp: number; icon: string; city: string } | null;
  usdKrw: { rate: number; prevRate: number | null } | null;
  btcUsd: { price: number; change24h: number | null } | null;
}

const WEATHER_ICONS: Record<string, typeof Sun> = {
  sun: Sun,
  cloud: Cloud,
  rain: CloudRain,
  snow: CloudSnow,
  thunder: CloudLightning,
  drizzle: CloudDrizzle,
  fog: CloudFog,
  cloudsun: CloudSun,
};

function mapWeatherCode(code: number): string {
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

const CACHE_KEY = "hf_infobar_v2";
const CACHE_TTL = 10 * 60 * 1000;

function getCached(): (MarketData & { ts: number }) | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.ts < CACHE_TTL) return parsed;
    return null;
  } catch {
    return null;
  }
}

function setCache(data: MarketData) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ...data, ts: Date.now() }));
  } catch {
    // ignore
  }
}

function formatPrice(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`.replace(".0K", "K");
  return n.toFixed(0);
}

function ChangeIndicator({ pct }: { pct: number | null }) {
  if (pct === null) return null;
  const isUp = pct >= 0;
  const Icon = isUp ? TrendingUp : TrendingDown;
  const color = isUp ? "text-emerald-500" : "text-red-500";
  return (
    <span className={`flex items-center gap-0.5 ${color}`}>
      <Icon className="h-2.5 w-2.5" />
      <span className="text-[10px] font-medium">{isUp ? "+" : ""}{pct.toFixed(1)}%</span>
    </span>
  );
}

export default function InfoBar() {
  const [data, setData] = useState<MarketData>({
    weather: null,
    usdKrw: null,
    btcUsd: null,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const cached = getCached();
    if (cached) {
      setData({ weather: cached.weather, usdKrw: cached.usdKrw, btcUsd: cached.btcUsd });
      return;
    }

    fetchAllData();
  }, []);

  async function fetchAllData() {
    const results = await Promise.allSettled([fetchWeather(), fetchExchangeRate(), fetchBtc()]);

    const weather = results[0].status === "fulfilled" ? results[0].value : null;
    const usdKrw = results[1].status === "fulfilled" ? results[1].value : null;
    const btcUsd = results[2].status === "fulfilled" ? results[2].value : null;

    const newData: MarketData = { weather, usdKrw, btcUsd };
    setData(newData);
    setCache(newData);
  }

  function fetchWithTimeout(url: string, ms = 3000): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
  }

  async function fetchWeather() {
    // Default: Seoul. Fetch immediately, then update with geolocation if available.
    const lat = 37.5665;
    const lon = 126.978;

    const res = await fetchWithTimeout(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`
    );
    if (!res.ok) throw new Error("Weather fetch failed");
    const d = await res.json();

    return {
      temp: Math.round(d.current.temperature_2m),
      icon: mapWeatherCode(d.current.weather_code),
      city: "Seoul",
    };
  }

  async function fetchExchangeRate() {
    const res = await fetchWithTimeout("https://open.er-api.com/v6/latest/USD");
    if (!res.ok) throw new Error("Exchange rate fetch failed");
    const d = await res.json();
    const rate = Math.round(d.rates?.KRW);

    // Try to get previous rate from old cache for change calculation
    let prevRate: number | null = null;
    try {
      const old = localStorage.getItem(CACHE_KEY);
      if (old) {
        const parsed = JSON.parse(old);
        if (parsed.usdKrw?.rate) prevRate = parsed.usdKrw.rate;
      }
    } catch {
      // ignore
    }

    return { rate, prevRate };
  }

  async function fetchBtc() {
    const res = await fetchWithTimeout(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true"
    );
    if (!res.ok) throw new Error("BTC fetch failed");
    const d = await res.json();
    return {
      price: Math.round(d.bitcoin?.usd),
      change24h: d.bitcoin?.usd_24h_change ? parseFloat(d.bitcoin.usd_24h_change.toFixed(1)) : null,
    };
  }

  if (!mounted) {
    return (
      <div className="bg-muted/30 border-b border-border">
        <div className="max-w-[1200px] mx-auto px-4 h-8" />
      </div>
    );
  }

  const WeatherIcon = data.weather ? WEATHER_ICONS[data.weather.icon] || CloudSun : null;

  // Calculate USD/KRW change percentage
  const krwChangePct = data.usdKrw?.prevRate && data.usdKrw.rate !== data.usdKrw.prevRate
    ? ((data.usdKrw.rate - data.usdKrw.prevRate) / data.usdKrw.prevRate) * 100
    : null;

  return (
    <div className="bg-muted/30 border-b border-border">
      <div className="max-w-[1200px] mx-auto px-4 h-8 flex items-center justify-center gap-3 md:gap-5 text-xs text-muted-foreground overflow-x-auto whitespace-nowrap scrollbar-hide">
        {data.weather && WeatherIcon && (
          <span className="flex items-center gap-1.5">
            <WeatherIcon className="h-3.5 w-3.5 text-amber-500" />
            <span className="font-medium text-foreground/80">{data.weather.temp}°</span>
            <span>{data.weather.city}</span>
          </span>
        )}

        {data.usdKrw && (
          <>
            {data.weather && <span className="text-border/60">|</span>}
            <span className="flex items-center gap-1.5">
              <DollarSign className="h-3 w-3 text-emerald-500" />
              <span>USD/KRW</span>
              <span className="font-medium text-foreground/80">{data.usdKrw.rate.toLocaleString()}</span>
              <ChangeIndicator pct={krwChangePct} />
            </span>
          </>
        )}

        {data.btcUsd && (
          <>
            {(data.weather || data.usdKrw) && <span className="text-border/60">|</span>}
            <span className="flex items-center gap-1.5">
              <Bitcoin className="h-3 w-3 text-orange-500" />
              <span>BTC</span>
              <span className="font-medium text-foreground/80">${formatPrice(data.btcUsd.price)}</span>
              <ChangeIndicator pct={data.btcUsd.change24h} />
            </span>
          </>
        )}
      </div>
    </div>
  );
}
