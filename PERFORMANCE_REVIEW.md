# Headlines Fazr 성능 점검 보고서

**점검일**: 2026-03-12
**점검 도구**: Claude Opus 4.6 코드 정적 분석
**대상**: https://headlines.fazr.co.kr

---

## 심각한 문제 (CRITICAL)

### 1. 이미지 최적화 비활성화

- **파일**: `next.config.ts`
- **문제**: `images: { unoptimized: true }` → Next.js 이미지 최적화 완전 비활성화
- **영향**: 모든 이미지가 원본 크기로 전송됨. WebP 변환, 자동 리사이징, 지연 로딩 혜택 없음
- **예상 영향**: 이미지 용량 30~50% 증가
- **해결**: `unoptimized: true` 제거

### 2. 홈페이지 DB 쿼리 11개 동시 실행

- **파일**: `src/app/page.tsx` (lines 16-23)
- **문제**: 페이지 로드 시 11개의 Supabase 쿼리가 `Promise.all()`로 동시 실행
  ```
  getTrendingArticles(15)
  getLatestArticles(15)
  getArticlesWithSummary(10)
  getBreakingArticles(5)
  getPopularKeywords(15)
  getArticlesByCategory × 6 (카테고리별)
  ```
- **영향**: DB 커넥션 풀 압박, TTFB(Time To First Byte) 느려짐
- **해결**: 카테고리를 6개 → 2~3개로 줄이거나, 쿼리 결과 캐싱

### 3. InfoBar 외부 API 3개 호출 (timeout 없음)

- **파일**: `src/components/InfoBar.tsx` (lines 113-123)
- **문제**: 날씨(open-meteo), 환율(er-api), 비트코인(coingecko) 3개 API 동시 호출
- **긍정적**: `Promise.allSettled()` 사용, 10분 캐시 있음
- **문제점**: timeout 미설정 → API 응답 지연 시 무한 대기 가능
- **해결**: fetch에 `AbortController` + 3초 timeout 추가

---

## 중간 수준 문제 (MODERATE)

### 4. getPopularKeywords 500행 fetch

- **파일**: `src/lib/articles.ts` (lines 151-172)
- **문제**: 인기 키워드 추출을 위해 매번 500개 기사 fetch → 클라이언트에서 집계
- **호출 위치**: 홈페이지, 기사 페이지, 토픽 사이드바 (모두 독립적으로 호출)
- **해결**: fetch 100개로 축소 또는 1시간 캐시 적용

### 5. 홈페이지 전체가 클라이언트 컴포넌트

- **파일**: `src/app/HomeContent.tsx` (line 1: `"use client"`)
- **문제**: 150+ 줄의 클라이언트 컴포넌트가 hydration 완료 전까지 콘텐츠 비노출
- **하위 컴포넌트**: Header, BreakingNewsTicker, HeadlineSection, CategorySection, Sidebar, Footer, ScrollToTop, ReadingProgress, AdUnit, TrendingTopics (10개+)
- **해결**: 인터랙티브 컴포넌트만 `"use client"`, 나머지는 Server Component로 분리

### 6. TrendingBar 클라이언트 API 호출

- **파일**: `src/components/TrendingBar.tsx` (line 37)
- **문제**: mount 후 `/api/trending-keywords` fetch → 네트워크 워터폴
- **긍정적**: 10분 캐시, fallback 키워드 있음
- **해결**: 홈페이지 데이터에서 preload 가능

### 7. Google Fonts 2개 패밀리 로딩

- **파일**: `src/app/layout.tsx` (lines 100-102)
- **로딩 폰트**: Newsreader (serif, 400-700), Noto Sans KR (sans, 300-700)
- **영향**: 한글 폰트 서브셋 ~30KB+ gzipped
- **해결**: 실제 사용 weight만 로드, `font-display: fallback` 고려

### 8. AdSense 스크립트 수동 DOM 조작

- **파일**: `src/components/AdSenseScript.tsx` (lines 10-15)
- **문제**: `document.querySelector` + `appendChild`로 스크립트 삽입
- **해결**: Next.js `<Script>` 컴포넌트 사용 권장

### 9. Service Worker HTML 캐시 없음

- **파일**: `public/sw.js` (lines 20-56)
- **현재**: HTML 페이지 캐시 안 함 (매번 네트워크 요청)
- **긍정적**: `_next/static/` 에셋은 cache-first ✓
- **해결**: stale-while-revalidate 전략 고려

### 10. Breaking Articles 워터폴 쿼리

- **파일**: `src/lib/articles.ts` (lines 198-223)
- **문제**: 6시간 내 기사 부족 시 두 번째 쿼리 실행 (순차적)
- **해결**: 단일 쿼리로 합치기

---

## 경미한 문제 (MINOR)

### 11. next.config.ts 압축 미설정

```typescript
// 현재 설정 없음. 추가 권장:
compress: true,
poweredByHeader: false,
```

### 12. 요청 중복 제거 없음

- 여러 페이지에서 `getPopularKeywords()` 독립적으로 호출
- React `use()` 또는 fetch deduplication 미적용

### 13. SafeImage lazy loading 미기본값

- **파일**: `src/components/SafeImage.tsx`
- **문제**: `loading` prop 지원하나 대부분 호출에서 미지정
- **해결**: 기본값을 `loading="lazy"`로 설정

---

## 요약 테이블

| 이슈 | 심각도 | 파일 | Quick Win |
|------|--------|------|-----------|
| 이미지 최적화 꺼짐 | CRITICAL | next.config.ts | ✅ |
| DB 쿼리 11개 동시 | HIGH | page.tsx | |
| InfoBar timeout 없음 | HIGH | InfoBar.tsx | ✅ |
| 키워드 500행 fetch | MODERATE | articles.ts | |
| 홈페이지 전체 client | MODERATE | HomeContent.tsx | |
| TrendingBar API 호출 | MODERATE | TrendingBar.tsx | |
| Google Fonts 2개 | MODERATE | layout.tsx | |
| compress 미설정 | MINOR | next.config.ts | ✅ |
| SafeImage lazy 미기본 | MINOR | SafeImage.tsx | ✅ |

---

## Quick Win (즉시 적용 가능)

1. `next.config.ts` → `unoptimized: true` 제거
2. `next.config.ts` → `compress: true, poweredByHeader: false` 추가
3. `SafeImage.tsx` → `loading="lazy"` 기본값 추가
4. `InfoBar.tsx` → fetch timeout 3초 추가

---

## 수정 금지 파일 (CLAUDE.md 준수)

- `src/lib/articles.ts` — 수정 불가
- `src/app/api/news-ingest/route.ts` — 수정 불가
- Supabase schema — 수정 불가

위 파일 관련 이슈(#4, #10, #12)는 별도 논의 필요.
