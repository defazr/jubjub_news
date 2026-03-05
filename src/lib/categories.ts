export interface CategoryInfo {
  name: string;
  slug: string;
  query: string;
  description: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { name: "정치", slug: "politics", query: "한국 정치 국회", description: "국내 정치, 국회, 청와대, 정당 관련 최신 뉴스" },
  { name: "경제", slug: "economy", query: "한국 경제 금융", description: "경제, 금융, 증시, 부동산, 기업 관련 최신 뉴스" },
  { name: "사회", slug: "society", query: "한국 사회 사건", description: "사회, 사건사고, 교육, 환경 관련 최신 뉴스" },
  { name: "국제", slug: "world", query: "국제 세계 외교", description: "국제, 세계, 외교, 글로벌 이슈 관련 최신 뉴스" },
  { name: "문화", slug: "culture", query: "한국 문화 예술 연예", description: "문화, 예술, 연예, 방송 관련 최신 뉴스" },
  { name: "IT/과학", slug: "tech", query: "IT 기술 과학 AI", description: "IT, 과학, 기술, 인공지능 관련 최신 뉴스" },
  { name: "스포츠", slug: "sports", query: "스포츠 축구 야구", description: "스포츠, 축구, 야구, KBO, K리그 관련 최신 뉴스" },
  { name: "오피니언", slug: "opinion", query: "사설 칼럼 오피니언", description: "사설, 칼럼, 오피니언, 전문가 의견" },
];

export function getCategoryBySlug(slug: string): CategoryInfo | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getCategoryByName(name: string): CategoryInfo | undefined {
  return CATEGORIES.find((c) => c.name === name);
}
