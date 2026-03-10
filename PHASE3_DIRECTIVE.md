# JubJub News — Phase 3 SSOT

**목표:** news-proxy 완전 제거, topic 페이지 SEO 강화, 광고 수익 구조 설계

---

## 작업 완료 현황

### 1. news-proxy 제거 ✅
- `netlify/functions/news-proxy.ts` 삭제
- `src/lib/api.ts`에서 `fetchTrendingNews()`, `searchNews()` 제거
- `src/app/world/page.tsx` → Supabase 직접 조회로 전환
- `src/app/search/page.tsx` → Supabase `ilike` 검색으로 전환
- `src/components/CategoryPage.tsx` → searchNews fallback 제거

### 2. 홈페이지 빈 데이터 문제 해결 ✅
- `getTrendingArticles()` 결과가 비면 `getLatestArticles()`로 fallback

### 3. Topic 페이지 SEO 강화 ✅
- SEO metadata 강화 (title, description, OG tags, canonical)
- 관련 토픽 internal linking 추가
- ISR revalidate 10분 설정
- 광고 슬롯 추가

### 4. 광고 구조
- 기사 상단/중간/하단 광고 슬롯
- Topic 페이지 광고 추가
- AI 페이지 광고 유지

---

## 현재 데이터 흐름

```
RapidAPI → news-ingest CRON → Supabase → Next.js ISR/SSR → 사용자
```

RapidAPI는 CRON에서만 사용. 사용자 요청은 100% DB 조회.

---

## Phase 3 완료 후 상태

| 기능 | 상태 |
|------|------|
| 뉴스 수집 | ✅ |
| AI 요약 | ✅ |
| DB 저장 | ✅ |
| 홈페이지 DB | ✅ |
| 카테고리 DB | ✅ |
| 해외 뉴스 DB | ✅ |
| 검색 DB | ✅ |
| 뉴스 페이지 | ✅ |
| Topic 페이지 | ✅ |
| AI 페이지 | ✅ |
| SEO 구조 | ✅ |
| Sitemap | ✅ |
| 광고 구조 | ✅ |
| news-proxy | ❌ 제거됨 |
