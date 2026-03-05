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

interface RawResponse {
  success: boolean;
  data: ApiArticle[];
}

const cache = new Map<string, { data: ApiArticle[]; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function cachedFetch(proxyUrl: string): Promise<ApiArticle[]> {
  const now = Date.now();
  const hit = cache.get(proxyUrl);
  if (hit && now - hit.ts < CACHE_TTL) return hit.data;

  try {
    const res = await fetch(proxyUrl);
    if (!res.ok) return [];
    const json: RawResponse = await res.json();
    const articles = (json.data || []).map((a) => ({
      title: a.title || "",
      url: a.url || "",
      excerpt: a.excerpt || "",
      thumbnail: a.thumbnail || "",
      language: a.language || "ko",
      date: a.date || "",
      authors: a.authors || [],
      publisher: {
        name: a.publisher?.name || "",
        url: a.publisher?.url || "",
        favicon: a.publisher?.favicon || "",
      },
    }));
    cache.set(proxyUrl, { data: articles, ts: now });
    return articles;
  } catch {
    return [];
  }
}

export async function fetchTrendingNews(
  topic: string = "general",
  language: string = "ko"
): Promise<ApiArticle[]> {
  return cachedFetch(
    `/.netlify/functions/news-proxy?endpoint=trending&topic=${topic}&language=${language}`
  );
}

export async function searchNews(
  query: string,
  language: string = "ko"
): Promise<ApiArticle[]> {
  return cachedFetch(
    `/.netlify/functions/news-proxy?endpoint=search&query=${encodeURIComponent(query)}&language=${language}`
  );
}

const translateCache = new Map<string, { data: string[]; ts: number }>();
const TRANSLATE_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

const CHUNK_SIZE = 10; // max texts per API call for reliability

async function translateChunk(
  texts: string[],
  targetLang: "ko" | "en"
): Promise<string[]> {
  try {
    const res = await fetch("/.netlify/functions/translate-proxy", {
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
  return translations;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}
