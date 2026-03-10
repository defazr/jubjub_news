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
  { name: "정치", slug: "politics", query: "한국 정치 국회", description: "국내 정치, 국회, 청와대, 정당 관련 최신 뉴스", color: "#3b82f6", dbCategory: "world" },
  { name: "경제", slug: "economy", query: "한국 경제 금융", description: "경제, 금융, 증시, 부동산, 기업 관련 최신 뉴스", color: "#22c55e", dbCategory: "business" },
  { name: "사회", slug: "society", query: "한국 사회 사건", description: "사회, 사건사고, 교육, 환경 관련 최신 뉴스", color: "#f97316", dbCategory: "health" },
  { name: "국제", slug: "world", query: "국제 세계 외교", description: "국제, 세계, 외교, 글로벌 이슈 관련 최신 뉴스", color: "#a855f7", dbCategory: "world" },
  { name: "문화", slug: "culture", query: "한국 문화 예술 연예", description: "문화, 예술, 연예, 방송 관련 최신 뉴스", color: "#ec4899", dbCategory: "entertainment" },
  { name: "IT/과학", slug: "tech", query: "IT 기술 과학 AI", description: "IT, 과학, 기술, 인공지능 관련 최신 뉴스", color: "#06b6d4", dbCategory: "technology" },
  { name: "스포츠", slug: "sports", query: "스포츠 축구 야구", description: "스포츠, 축구, 야구, KBO, K리그 관련 최신 뉴스", color: "#ef4444", dbCategory: "sports" },
  { name: "오피니언", slug: "opinion", query: "사설 칼럼 오피니언", description: "사설, 칼럼, 오피니언, 전문가 의견", color: "#eab308", dbCategory: "science" },
];

/** DB categories used on the homepage with Korean labels */
export const HOMEPAGE_CATEGORIES: { db: string; label: string; color: string }[] = [
  { db: "technology", label: "IT/과학", color: "#06b6d4" },
  { db: "business", label: "경제", color: "#22c55e" },
  { db: "world", label: "국제", color: "#a855f7" },
  { db: "science", label: "과학", color: "#3b82f6" },
  { db: "sports", label: "스포츠", color: "#ef4444" },
  { db: "health", label: "사회", color: "#f97316" },
  { db: "entertainment", label: "문화", color: "#ec4899" },
  { db: "ai", label: "AI", color: "#8b5cf6" },
];

/** Extra color map for DB category labels not in CATEGORIES */
const EXTRA_COLORS: Record<string, string> = {
  "과학": "#3b82f6",
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
