export interface ApiArticle {
  title: string;
  url: string;
  excerpt: string;
  thumbnail: string;
  language: string;
  date: string;
  authors: string[];
  publisher: {
    name: string;
    url: string;
    favicon: string;
  };
}

const translateCache = new Map<string, { data: string[]; ts: number }>();
const TRANSLATE_CACHE_TTL = 60 * 60 * 1000; // 1 hour

// localStorage-based persistent cache
const LS_TRANSLATE_KEY = "jubjub_translate_cache";
const LS_TRANSLATE_TTL = 2 * 60 * 60 * 1000; // 2 hours

function loadLocalCache(): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(LS_TRANSLATE_KEY);
    if (!raw) return;
    const entries: [string, { data: string[]; ts: number }][] = JSON.parse(raw);
    const now = Date.now();
    for (const [key, val] of entries) {
      if (now - val.ts < LS_TRANSLATE_TTL) {
        translateCache.set(key, val);
      }
    }
  } catch { /* ignore */ }
}

function saveLocalCache(): void {
  if (typeof window === "undefined") return;
  try {
    const now = Date.now();
    const entries = [...translateCache.entries()].filter(
      ([, v]) => now - v.ts < LS_TRANSLATE_TTL
    );
    localStorage.setItem(LS_TRANSLATE_KEY, JSON.stringify(entries));
  } catch { /* ignore */ }
}

// Load persisted translations on module init
loadLocalCache();

const CHUNK_SIZE = 10; // max texts per API call for reliability

async function translateChunk(
  texts: string[],
  targetLang: "ko" | "en"
): Promise<string[]> {
  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts, targetLang }),
    });
    if (!res.ok) return texts;
    const json = await res.json();
    return json.translations || texts;
  } catch {
    return texts;
  }
}

export async function translateTexts(
  texts: string[],
  targetLang: "ko" | "en"
): Promise<string[]> {
  const key = `${targetLang}:${texts.join("|")}`;
  const hit = translateCache.get(key);
  if (hit && Date.now() - hit.ts < TRANSLATE_CACHE_TTL) return hit.data;

  // Split into small chunks and translate in parallel
  const chunks: string[][] = [];
  for (let i = 0; i < texts.length; i += CHUNK_SIZE) {
    chunks.push(texts.slice(i, i + CHUNK_SIZE));
  }

  const results = await Promise.all(
    chunks.map((chunk) => translateChunk(chunk, targetLang))
  );
  const translations = results.flat();

  translateCache.set(key, { data: translations, ts: Date.now() });
  saveLocalCache();
  return translations;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}
