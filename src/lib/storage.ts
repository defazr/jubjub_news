// Bookmark, Read Articles, Search History - localStorage utilities

const BOOKMARKS_KEY = "jubjub_bookmarks";
const READ_KEY = "jubjub_read_articles";
const SEARCH_HISTORY_KEY = "jubjub_search_history";

// --- Bookmarks ---
export interface BookmarkedArticle {
  url: string;
  title: string;
  excerpt: string;
  thumbnail: string;
  publisher: string;
  date: string;
  savedAt: number;
}

export function getBookmarks(): BookmarkedArticle[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isBookmarked(url: string): boolean {
  return getBookmarks().some((b) => b.url === url);
}

export function toggleBookmark(article: BookmarkedArticle): boolean {
  const bookmarks = getBookmarks();
  const idx = bookmarks.findIndex((b) => b.url === article.url);
  if (idx >= 0) {
    bookmarks.splice(idx, 1);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    return false;
  } else {
    bookmarks.unshift({ ...article, savedAt: Date.now() });
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    return true;
  }
}

export function removeBookmark(url: string): void {
  const bookmarks = getBookmarks().filter((b) => b.url !== url);
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
}

// --- Read Articles ---
export function getReadUrls(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(READ_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function markAsRead(url: string): void {
  if (typeof window === "undefined") return;
  const read = getReadUrls();
  read.add(url);
  const arr = [...read].slice(-500);
  localStorage.setItem(READ_KEY, JSON.stringify(arr));
}

// --- Search History ---
export function getSearchHistory(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addSearchHistory(query: string): void {
  if (typeof window === "undefined") return;
  const history = getSearchHistory().filter((q) => q !== query);
  history.unshift(query);
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history.slice(0, 10)));
}

export function removeSearchHistoryItem(query: string): void {
  if (typeof window === "undefined") return;
  const history = getSearchHistory().filter((q) => q !== query);
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
}

export function clearSearchHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SEARCH_HISTORY_KEY);
}

// --- Font Size ---
const FONT_SIZE_KEY = "jubjub_font_size";

export function getFontSize(): number {
  if (typeof window === "undefined") return 16;
  try {
    const raw = localStorage.getItem(FONT_SIZE_KEY);
    return raw ? parseInt(raw, 10) : 16;
  } catch {
    return 16;
  }
}

export function setFontSize(size: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(FONT_SIZE_KEY, String(size));
}

// --- Layout Preference ---
const LAYOUT_KEY = "jubjub_layout";

export function getLayout(): "grid" | "list" {
  if (typeof window === "undefined") return "grid";
  try {
    const raw = localStorage.getItem(LAYOUT_KEY);
    return raw === "list" ? "list" : "grid";
  } catch {
    return "grid";
  }
}

export function setLayoutPref(layout: "grid" | "list"): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LAYOUT_KEY, layout);
}
