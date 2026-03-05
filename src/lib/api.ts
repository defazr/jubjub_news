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

interface RawArticle {
  title: string;
  link: string;
  snippet: string;
  photo_url: string;
  thumbnail_url: string;
  published_datetime_utc: string;
  authors: string[];
  source_url: string;
  source_name: string;
  source_favicon_url: string;
}

interface RawResponse {
  status: string;
  data: RawArticle[];
}

function transform(raw: RawArticle): ApiArticle {
  return {
    title: raw.title,
    url: raw.link,
    excerpt: raw.snippet || "",
    thumbnail: raw.photo_url || raw.thumbnail_url || "",
    language: "ko",
    date: raw.published_datetime_utc,
    authors: raw.authors || [],
    publisher: {
      name: raw.source_name || "",
      url: raw.source_url || "",
      favicon: raw.source_favicon_url || "",
    },
  };
}

export async function fetchTrendingNews(
  topic: string = "general"
): Promise<ApiArticle[]> {
  try {
    const res = await fetch("/api/news?type=headlines");
    if (!res.ok) return [];
    const data: RawResponse = await res.json();
    return (data.data || []).map(transform);
  } catch {
    return [];
  }
}

export async function searchNews(query: string): Promise<ApiArticle[]> {
  try {
    const res = await fetch(`/api/news?type=search&query=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data: RawResponse = await res.json();
    return (data.data || []).map(transform);
  } catch {
    return [];
  }
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}
