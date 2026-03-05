export interface ApiArticle {
  title: string;
  url: string;
  excerpt: string;
  thumbnail: string;
  language: string;
  date: string;
  authors: string[];
  keywords: string[];
  publisher: {
    name: string;
    url: string;
    favicon: string;
  };
}

interface ApiResponse {
  success: boolean;
  size: number;
  totalHits: number;
  data: ApiArticle[];
}

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "";
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || "news-api14.p.rapidapi.com";

const headers = {
  "x-rapidapi-host": RAPIDAPI_HOST,
  "x-rapidapi-key": RAPIDAPI_KEY,
};

export async function fetchTrendingNews(
  topic: string = "general"
): Promise<ApiArticle[]> {
  const res = await fetch(
    `https://${RAPIDAPI_HOST}/v2/trendings?topic=${topic}&language=ko`,
    { headers, cache: "no-store" }
  );
  if (!res.ok) return [];
  const data: ApiResponse = await res.json();
  return data.data || [];
}

export async function searchNews(query: string): Promise<ApiArticle[]> {
  const res = await fetch(
    `https://${RAPIDAPI_HOST}/v2/search/articles?query=${encodeURIComponent(query)}&language=ko`,
    { headers, cache: "no-store" }
  );
  if (!res.ok) return [];
  const data: ApiResponse = await res.json();
  return data.data || [];
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}
