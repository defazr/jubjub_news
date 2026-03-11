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
  TrendingUp,
  DollarSign,
  Bitcoin,
} from "lucide-react";

interface MarketData {
  weather: { temp: number; icon: string; city: string } | null;
  usdKrw: number | null;
  btcUsd: number | null;
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

const CACHE_KEY = "hf_infobar_cache";
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

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

function formatNum(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`.replace(".0K", "K");
  return n.toFixed(0);
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

  async function fetchWeather() {
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
        // Reverse geocode
        try {
          const geoRes = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=_&latitude=${lat}&longitude=${lon}&count=1`
          );
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            if (geoData.results?.[0]?.name) {
              city = geoData.results[0].name;
            }
          }
        } catch {
          city = "My Location";
        }
      } catch {
        // Default Seoul
      }
    }

    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`
    );
    if (!res.ok) throw new Error("Weather fetch failed");
    const d = await res.json();
    return {
      temp: Math.round(d.current.temperature_2m),
      icon: mapWeatherCode(d.current.weather_code),
      city,
    };
  }

  async function fetchExchangeRate() {
    const res = await fetch("https://open.er-api.com/v6/latest/USD");
    if (!res.ok) throw new Error("Exchange rate fetch failed");
    const d = await res.json();
    return Math.round(d.rates?.KRW);
  }

  async function fetchBtc() {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
    );
    if (!res.ok) throw new Error("BTC fetch failed");
    const d = await res.json();
    return Math.round(d.bitcoin?.usd);
  }

  if (!mounted) {
    return (
      <div className="bg-muted/30 border-b border-border">
        <div className="max-w-[1200px] mx-auto px-4 h-8" />
      </div>
    );
  }

  const WeatherIcon = data.weather ? WEATHER_ICONS[data.weather.icon] || CloudSun : null;

  return (
    <div className="bg-muted/30 border-b border-border">
      <div className="max-w-[1200px] mx-auto px-4 h-8 flex items-center justify-center gap-4 md:gap-6 text-xs text-muted-foreground overflow-x-auto whitespace-nowrap">
        {data.weather && WeatherIcon && (
          <span className="flex items-center gap-1">
            <WeatherIcon className="h-3.5 w-3.5 text-amber-500" />
            <span>{data.weather.city}</span>
            <span className="font-medium text-foreground/80">{data.weather.temp}°</span>
          </span>
        )}

        {data.usdKrw && (
          <>
            <span className="text-border">|</span>
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3 text-green-500" />
              <span>USD/KRW</span>
              <span className="font-medium text-foreground/80">{data.usdKrw.toLocaleString()}</span>
            </span>
          </>
        )}

        {data.btcUsd && (
          <>
            <span className="text-border">|</span>
            <span className="flex items-center gap-1">
              <Bitcoin className="h-3 w-3 text-orange-500" />
              <span>BTC</span>
              <span className="font-medium text-foreground/80">${formatNum(data.btcUsd)}</span>
            </span>
          </>
        )}
      </div>
    </div>
  );
}
