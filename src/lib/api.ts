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
  topic: string = "general"
): Promise<ApiArticle[]> {
  return cachedFetch(
    `/.netlify/functions/news-proxy?endpoint=trending&topic=${topic}`
  );
}

export async function searchNews(query: string): Promise<ApiArticle[]> {
  return cachedFetch(
    `/.netlify/functions/news-proxy?endpoint=search&query=${encodeURIComponent(query)}`
  );
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}
