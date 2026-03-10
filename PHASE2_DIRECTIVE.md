# JubJub News — Phase 2 Implementation Directive

**목표:** 홈페이지/카테고리 페이지를 Supabase DB 기반으로 전환하고, SEO sitemap 구조 추가.

---

## 현재 상태

### 이미 구현 완료
- news-ingest CRON → RapidAPI 수집 → Claude 요약 → Supabase 저장
- /news/[slug] SSR 페이지
- /topic/[keyword] 페이지
- /ai 페이지

### 현재 문제
- 홈페이지: `/.netlify/functions/news-proxy` → RapidAPI
- 카테고리: `searchNews()` → RapidAPI
- 방문자 증가 = API 호출 증가 문제

### Phase 2 목표 구조
```
Supabase → Next.js SSR → 사용자
RapidAPI는 CRON 수집에서만 사용
```

---

## 작업 범위

### 1. Homepage DB 전환

**현재:** homepage → news-proxy → RapidAPI
**변경:** homepage → Supabase → articles 테이블

**사용할 쿼리 함수:** `src/lib/articles.ts`

**홈페이지 구성:**

| 섹션 | 쿼리 |
|------|------|
| Trending | `getTrendingArticles(10)` |
| Latest News | `SELECT * FROM articles ORDER BY published_at DESC LIMIT 30` |
| AI 뉴스 | `summary IS NOT NULL LIMIT 10` |
| Popular Keywords | `getPopularKeywords()` |

### 2. Category 페이지 DB 전환

**현재:** category → searchNews() → RapidAPI
**변경:** category → getArticlesByCategory()

```sql
SELECT * FROM articles
WHERE category = $category
ORDER BY published_at DESC
LIMIT 30
```

예: `/category/technology`, `/category/business`, `/category/science`

### 3. API Proxy 제거 준비

- `/.netlify/functions/news-proxy` — 지금은 삭제하지 말고 유지
- Phase 3에서 제거

### 4. Sitemap 생성

**파일 구조:**
```
src/app/sitemap.xml/route.ts        → sitemap index
src/app/sitemap-news.xml/route.ts   → /news/[slug]
src/app/sitemap-topics.xml/route.ts → /topic/[keyword]
```

- sitemap-news.xml: articles 테이블에서 slug 조회
- sitemap-topics.xml: keywords 배열 기반 distinct

### 5. news-ingest 성능 개선

**현재:** 80 기사 × AI 호출 = 약 96초 (Netlify 제한 10~26초)

**수정:**
```typescript
for (const batch of chunks(articles, 10)) {
  await Promise.allSettled(batch.map(generateSummary));
}
```

### 6. AI 요약 길이 조정

**현재:** 150~200 단어
**변경:** 50~80 단어 또는 AI Key Points 4개

```
AI Key Points
• 핵심 포인트 1
• 핵심 포인트 2
• 핵심 포인트 3
• 핵심 포인트 4
```

### 7. /topic 페이지 강화

- `/topic/ai`, `/topic/openai`, `/topic/nvidia`, `/topic/tesla`
- sitemap-topics.xml에 반드시 포함

---

## 변경 파일 예상

```
src/app/page.tsx
src/app/category/[category]/page.tsx
src/app/sitemap.xml/route.ts
src/app/sitemap-news.xml/route.ts
src/app/sitemap-topics.xml/route.ts
netlify/functions/news-ingest.ts
```

---

## 테스트 기준

1. homepage가 Supabase에서 데이터 로드
2. category 페이지가 DB에서 데이터 로드
3. news-ingest 실행 후 articles 테이블 증가
4. sitemap.xml 정상 출력
5. /news/[slug] 정상 렌더링

---

## 완료 후 제출

- 변경 파일 목록
- 빌드 결과
- 테스트 결과
- 다음 단계 제안
