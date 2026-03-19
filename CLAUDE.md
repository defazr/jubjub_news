# Headlines Fazr - SSOT 운영 지시서 v1.1

IMPORTANT: This project is deployed on Netlify, NOT Vercel.

## 프로젝트 정보

- **사이트**: https://headlines.fazr.co.kr
- **호스팅**: Netlify (Vercel 아님)
- **배포**: Netlify Git deploy (Clear cache and deploy)
- **CDN**: Netlify CDN
- **아키텍처**: RapidAPI → /api/news-ingest → Claude AI summary → Supabase → Next.js ISR
- **상태**: 개발 완료. 운영 단계.
- **완성도**: 95%
- **개발 단계**: 사실상 종료. 이제 필요한 것은 뉴스 축적 + Discover 진입.

## 현재 시스템 상태 (확인 완료)

| 영역 | 상태 |
|------|------|
| 뉴스 수집 | 정상 (/api/news-ingest) |
| AI 요약 | 정상 (Claude Haiku) |
| 번역 | 정상 (/api/translate) |
| DB | articles 231+ |
| SEO 메타 | 정상 (og, twitter, canonical) |
| sitemap | 정상 (sitemap.xml, sitemap-news.xml, sitemap-topics.xml) |
| robots.txt | 정상 |
| 광고 | 정상 (AdSense - top/mid/bottom) |
| 검색엔진 등록 | 완료 (Google, Naver, Bing) |
| TypeScript error | 0 |
| Hydration error | 해결 |
| Image CDN error | 해결 |
| 캐시 | 안정 |

### 뉴스 파이프라인 상태

```
fetched: 217  inserted: 31  duplicates: 186  errors: 0  summaries: 31
```

- 예상 기사 생산량: 하루 150~250 기사
- 정상 운영 패턴: inserted 20~40, duplicates 100+, errors 0

## 이미 해결된 문제 (수정 금지)

### 1. React Hydration 오류

- **문제**: React error #418
- **원인**: InfoBar 날씨/client 데이터 mismatch
- **해결**: mounted guard + skeleton placeholder 적용
- **파일**: `InfoBar.tsx`
- **수정 금지**

### 2. CDN 이미지 422 오류

- **문제**: 422 Unprocessable Content (contentstack CDN resize 파라미터 미지원)
- **해결**: `sanitizeImageUrl()` query parameter 제거
- **파일**: `SafeImage.tsx`
- **로직**: 1차 sanitize URL → 2차 query 제거 → 3차 fallback OG 이미지
- **수정 금지**

### 3. Image fallback

- **구현**: naturalWidth 체크 + onError fallback
- **fallback**: `/Headlines_Fazr_OG_image.png`
- **수정 금지**

## 캐시 정책 (확정, 수정 금지)

| 페이지 | 캐시 |
|--------|------|
| homepage | 60s |
| topic | 300s |
| article | 3600s |
| digest | 3600s |

- Service Worker: HTML cache 없음, static assets cache-first

## 페이지 구조

```
/                    → 홈페이지
/ai                  → AI 요약 뉴스
/news/[slug]         → 기사 페이지
/topic/[keyword]     → 토픽 페이지
/category/[slug]     → 카테고리 페이지
/search              → 검색
```

## 핵심 파일

| 파일 | 역할 |
|------|------|
| src/lib/articles.ts | DB 쿼리 (getArticlesByKeyword, getPopularKeywords 등) |
| src/app/topic/[keyword]/page.tsx | Topic SEO 페이지 |
| src/app/news/[slug]/page.tsx | 기사 SEO 페이지 |
| src/app/ai/AiArticleList.tsx | AI 기사 리스트 (mid-ai 광고 포함) |
| src/components/AdUnit.tsx | AdSense 광고 컴포넌트 (SLOT_MAP) |
| src/components/SafeImage.tsx | 이미지 fallback + sanitize |
| src/components/InfoBar.tsx | 날씨/환율/BTC (hydration guard) |
| src/app/api/backfill-summaries/route.ts | AI summary backfill API |
| src/app/api/news-ingest/route.ts | 뉴스 수집 API |
| src/app/sitemap-topics.xml/route.ts | Topic sitemap (CORE_KEYWORDS + DB) |
| src/lib/categories.ts | 카테고리 매핑 |

## 뉴스 ingest 구조 (수정 금지)

- **cron**: 1시간마다 `/api/news-ingest?summarize=true`
- **동작**: news api fetch → duplicate filter → AI summary → DB insert

## Backfill 실행 방법

```
GET /api/backfill-summaries?secret=INGEST_SECRET&limit=50
```
- summary 없는 기사에 AI 요약 생성
- 50개씩 실행, 약 5회 반복으로 전체 처리

## Topic 검색 구조

```typescript
// src/lib/articles.ts
.or(`keywords.cs.{${keyword}},title.ilike.%${keyword}%`)
```
- keywords contains OR title ILIKE 방식
- category 기반 필터 아님

## 광고 정책

### 슬롯 매핑 (AdUnit.tsx)

| 슬롯 | AdSense ID |
|------|-----------|
| top-article | 9121339058 |
| mid-article | 2248808942 |
| bottom-article | 9121339058 |
| top-ai | 9121339058 |
| mid-ai | 2248808942 |
| bottom-ai | 2248808942 |
| top-home | 9121339058 |
| bottom-home | 2248808942 |
| top-topic | 9121339058 |
| bottom-topic | 2248808942 |

### 광고 규칙

- **금지**: header 아래 광고
- **허용**: article top / mid / bottom

## UI 구조 (확정)

```
Header:  Headlines Fazr          ☰
InfoBar: weather  usd/krw  btc
TrendingBar: 🔥 Trending  AI · Nvidia · Tesla
높이: 120px
```

## 카테고리 매핑 (검토 필요)

| 카테고리 | dbCategory | 비고 |
|---------|-----------|------|
| 정치 | world | 국제와 중복 |
| 경제 | business | |
| 사회 | health | |
| 국제 | world | 정치와 중복 |
| 문화 | entertainment | |
| IT/과학 | technology | |
| 스포츠 | sports | |
| 오피니언 | science | 매핑 이상 |

## 작업 원칙

1. **아키텍처 변경 금지**: RapidAPI → ingest → Supabase → Next.js
2. **UI 변경 최소화**
3. **API 구조 변경 금지**
4. **DB schema 변경 금지**

## 수정 금지 파일

- `src/lib/articles.ts`
- `src/app/api/news-ingest/route.ts`
- Supabase schema

## Topic Sitemap 기본 키워드

sitemap-topics.xml에 항상 포함되는 키워드:
```
ai, chatgpt, openai, nvidia, apple, tesla, microsoft, google, meta,
amazon, bitcoin, crypto, startup, semiconductor, iphone, android,
robot, space, quantum, gpu, gpt5, gemini, copilot, deepseek,
anthropic, samsung, economy, climate, cybersecurity, 5g, ev, cloud
```
+ DB에서 자동 추출되는 인기 키워드 (최대 200개)

## Discover 준비 상태

| 항목 | 상태 |
|------|------|
| JSON-LD | 완료 |
| og:image 1200+ | 완료 |
| sitemap | 완료 |
| RSS | 완료 |
| topic pages | 완료 |
| digest | 완료 |
| breaking news | 완료 |
| trending | 완료 |

- **준비도**: 95%
- **Discover 테스트 가능 시점**: 기사 200~400개 축적 시 (약 7~10일)

## 다음 안정화 작업 (필수)

### 1. ingest 상태 확인 API

- **새 API**: `/api/news-status`
- **return**: `{ lastIngest: timestamp, lastInserted: number, articles24h: number }`
- **Supabase query**:
  - 최근 기사: `ORDER BY created_at DESC LIMIT 1`
  - 24시간 기사 수: `created_at > now() - interval '24 hours'`
- **목적**: 운영 상태 모니터링

### 2. ingest 로그 추가

- **파일**: `api/news-ingest/route.ts`
- **추가**: `console.log("[INGEST]", { fetched, inserted, duplicates, summaries })`
- **목적**: 디버깅

### 3. ingest 보안 강화

- **문제**: secret 노출 가능
- **수정**: `.env` INGEST_SECRET 사용
- **요청**: `/api/news-ingest?secret=ENV_SECRET`
- **secret 없으면**: status 404

## 운영 로그

### 2026-03-14

- **GitHub Actions Cron 복구 완료**
  - 문제: GitHub Secrets에 키가 설정되지 않아 News Ingest Cron이 계속 실패하고 있었음
  - 해결: GitHub repo → Settings → Secrets and variables → Actions에 필요한 키 등록
  - 수동 실행 결과: `Response code: 200` (성공)
  - 1시간마다 자동 실행되므로 이후 뉴스 수집 정상 동작 중
- **확인 방법**: GitHub Actions 탭에서 "News Ingest Cron" 실행 이력 확인

### 2026-03-19

- **/category/ai 404 수정 완료**
  - 문제: Digest 페이지 "View all" 링크가 `/category/ai`로 연결되나 해당 페이지 미존재 → 404
  - 원인: `HOMEPAGE_CATEGORIES`에 AI 있으나, `CATEGORIES` 배열과 `/category/ai/page.tsx` 없음
  - 해결:
    - `src/lib/categories.ts` — `CATEGORIES`에 AI 항목 추가 (`slug: "ai"`, `dbCategory: "ai"`)
    - `src/app/category/ai/page.tsx` — 신규 생성 (기존 카테고리 페이지와 동일 패턴)
  - TypeScript 에러: 0개
  - 커밋: `bd2042d`
- **현재 상태**: 개발 종료. 운영 + 관찰 단계. 기사 636+, 자동 ingest/AI summary/dedupe 정상.
- **주의**: 구조 수정, Topic 추가, URL 변경, 내부링크 구조 변경 금지. 데이터 축적 + Discover 반응 대기 중.

## 다음 단계 (추후 작업, 지금은 진행하지 않음)

1. Discover 카드 개선
2. Topic cluster 확장
3. Digest 확장
4. Google News 정식 신청
