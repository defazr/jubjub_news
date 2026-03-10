# JubJub 뉴스 - Google 색인 개선 계획

## 현재 문제

Google Search Console에서 카테고리 페이지들이 **"적절한 표준 태그가 포함된 대체 페이지"**로 분류되어 색인이 생성되지 않고 있음.

## 원인 분석

### 1. CSR (Client-Side Rendering) 문제
- 모든 페이지가 `"use client"` + `useEffect`로 데이터를 로딩
- Google 봇이 방문하면 **빈 HTML 껍데기**만 보임
- 뉴스 데이터가 JavaScript 실행 후에만 렌더링됨

### 2. 카테고리 페이지 중복
- 카테고리 페이지들이 메인 페이지와 거의 동일한 구조
- 같은 API 데이터를 필터만 달리해서 보여줌
- Google이 **중복 콘텐츠**로 판단

### 3. 고유 콘텐츠 부재
- 모든 기사가 외부 링크로 나가는 구조
- 사이트 자체의 **고유 텍스트 콘텐츠가 사실상 없음**
- 페이지 수 자체가 매우 적음 (10개 미만)

---

## 개선 아이디어

### 1순위: SSR/ISR 전환 (필수)

카테고리 페이지를 **Server Component + ISR (Incremental Static Regeneration)** 으로 전환해야 함.

```tsx
// 예시: app/category/[slug]/page.tsx
export const revalidate = 1800; // 30분마다 재생성

export default async function CategoryPage({ params }) {
  const articles = await fetchCategoryNews(params.slug);
  return <CategoryView articles={articles} />;
}
```

- Google 봇이 방문하면 **완성된 HTML**을 바로 볼 수 있음
- `revalidate = 1800` (30분) 같은 주기로 정적 생성
- 기존 클라이언트 인터랙션은 별도 Client Component로 분리

### 2순위: AI 브리핑 콘텐츠 (고유 콘텐츠 확보)

각 카테고리별 **오늘의 뉴스 브리핑**을 AI로 자동 생성:

- "오늘 정치 분야에서는 A, B, C가 주요 이슈입니다" 같은 2~3문단 요약
- 이것이 사이트만의 **고유 콘텐츠**가 됨
- Google이 "이 사이트만의 가치 있는 콘텐츠"로 인식
- 매일 갱신되므로 freshness signal도 확보

### 3순위: 페이지 수 대폭 증가

현재 10개 미만 → 수백 개로 확장:

| 새 페이지 유형 | URL 패턴 | 예상 페이지 수 |
|---------------|----------|--------------|
| 키워드별 뉴스 | `/topic/[keyword]` (AI, 부동산, 환율 등) | 50~100개 |
| 날짜별 아카이브 | `/daily/[date]` (2026-03-10) | 매일 1개씩 누적 |
| 언론사별 모아보기 | `/publisher/[name]` | 20~30개 |

### 4순위: SEO 메타 + 구조화 데이터

#### 각 페이지별 고유 메타 태그
```tsx
// 각 카테고리마다 고유한 title, description
export const metadata = {
  title: "정치 뉴스 - JubJub 뉴스",
  description: "오늘의 한국 정치 뉴스. 국회, 청와대, 정당 관련 최신 소식을 실시간으로 전합니다.",
};
```

#### 동적 sitemap.xml
```tsx
// app/sitemap.ts
export default async function sitemap() {
  const categories = ['politics', 'economy', 'society', ...];
  const topics = await getActiveTopics();

  return [
    { url: 'https://headlines.fazr.co.kr', changeFrequency: 'hourly' },
    ...categories.map(cat => ({
      url: `https://headlines.fazr.co.kr/category/${cat}`,
      changeFrequency: 'hourly',
    })),
    ...topics.map(topic => ({
      url: `https://headlines.fazr.co.kr/topic/${topic}`,
      changeFrequency: 'daily',
    })),
  ];
}
```

#### NewsArticle JSON-LD 구조화 데이터
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "정치 뉴스",
  "description": "오늘의 한국 정치 뉴스 모음",
  "publisher": {
    "@type": "Organization",
    "name": "JubJub 뉴스"
  }
}
</script>
```

---

## 우선순위 요약

| 순위 | 작업 | 효과 | 난이도 |
|------|------|------|--------|
| 1 | SSR/ISR 전환 | 크롤링 가능하게 만듦 (필수) | 중 |
| 2 | AI 브리핑 콘텐츠 | 고유 콘텐츠 확보 | 중~상 |
| 3 | topic/daily/publisher 페이지 | 페이지 수 대폭 증가 | 중 |
| 4 | 동적 sitemap + JSON-LD | Google에 구조 알려주기 | 하 |

## 핵심 요약

> **"CSR → SSR 전환"** + **"AI 기반 고유 콘텐츠 생성"** + **"페이지 수 확장"**
>
> 이 세 가지가 해결되면 Google이 사이트를 "콘텐츠가 풍부하고 크롤링 가능한 뉴스 사이트"로 인식할 것.

---

## 현재 기술 스택

- Next.js (App Router)
- Tailwind CSS + shadcn/ui
- 클라이언트 사이드 API 호출 (gnews API)
- Vercel 배포
