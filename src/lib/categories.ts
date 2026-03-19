export interface CategoryInfo {
  name: string;
  slug: string;
  query: string;
  description: string;
  color: string;
  /** Matching category name in Supabase articles table */
  dbCategory?: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { name: "Politics", slug: "politics", query: "politics government", description: "Latest political news, government, and policy updates", color: "#3b82f6", dbCategory: "world" },
  { name: "Economy", slug: "economy", query: "economy finance markets", description: "Economy, finance, markets, and business news", color: "#22c55e", dbCategory: "business" },
  { name: "Society", slug: "society", query: "society community", description: "Society, community, education, and environment news", color: "#f97316", dbCategory: "health" },
  { name: "World", slug: "world", query: "world international diplomacy", description: "International, world, and global affairs news", color: "#a855f7", dbCategory: "world" },
  { name: "Culture", slug: "culture", query: "culture arts entertainment", description: "Culture, arts, entertainment, and media news", color: "#ec4899", dbCategory: "entertainment" },
  { name: "Tech", slug: "tech", query: "technology science AI", description: "Technology, science, and AI news", color: "#06b6d4", dbCategory: "technology" },
  { name: "Sports", slug: "sports", query: "sports football baseball", description: "Sports, football, baseball, and athletics news", color: "#ef4444", dbCategory: "sports" },
  { name: "Opinion", slug: "opinion", query: "opinion editorial column", description: "Editorials, columns, and expert opinions", color: "#eab308", dbCategory: "science" },
  { name: "AI", slug: "ai", query: "AI artificial intelligence machine learning", description: "AI, machine learning, and artificial intelligence news", color: "#8b5cf6", dbCategory: "ai" },
];

/** DB categories used on the homepage */
export const HOMEPAGE_CATEGORIES: { db: string; label: string; color: string }[] = [
  { db: "technology", label: "Tech", color: "#06b6d4" },
  { db: "business", label: "Economy", color: "#22c55e" },
  { db: "world", label: "World", color: "#a855f7" },
  { db: "science", label: "Science", color: "#3b82f6" },
  { db: "sports", label: "Sports", color: "#ef4444" },
  { db: "health", label: "Society", color: "#f97316" },
  { db: "entertainment", label: "Culture", color: "#ec4899" },
  { db: "ai", label: "AI", color: "#8b5cf6" },
];

/** Extra color map for DB category labels not in CATEGORIES */
const EXTRA_COLORS: Record<string, string> = {
  "Science": "#3b82f6",
  "AI": "#8b5cf6",
};

export function getCategoryBySlug(slug: string): CategoryInfo | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getCategoryByName(name: string): CategoryInfo | undefined {
  const cat = CATEGORIES.find((c) => c.name === name);
  if (cat) return cat;
  const extraColor = EXTRA_COLORS[name];
  if (extraColor) return { name, slug: name.toLowerCase(), query: "", description: "", color: extraColor };
  return undefined;
}
