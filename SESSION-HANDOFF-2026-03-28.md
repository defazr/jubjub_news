# Headlines Fazr — 세션 핸드오프 (2026-03-28)

## 현재 상태

- 사이트: https://headlines.fazr.co.kr
- 브랜치: `claude/review-markdown-files-Pawh5`
- 기사 수: 1,080+
- 파이프라인: 정상 운영 중
- 단계: Google Discover 진입 대기

---

## 이번 세션에서 한 작업

### 1. OG 이미지 WebP → PNG 변경 (완료, 배포됨)

Twitter가 WebP를 지원하지 않아 카드 이미지가 안 뜨던 문제 수정.

변경 파일:
- `src/app/layout.tsx` — og:image, twitter:image `.webp` → `.png`
- `src/app/news/[slug]/page.tsx` — fallback OG `.webp` → `.png`
- `src/app/digest/page.tsx` — og:image `.webp` → `.png`
- `src/app/api/og-image/route.ts` — FALLBACK_URL `.png` + 타임아웃 5초 → 3초

### 2. AI 검색/카테고리 문제 분석 (보류, 수정 금지)

3건의 문제를 발견했으나 Google 평가 중이므로 전부 보류.
상세: `REVIEW-AI-SEARCH-2026-03-25.md`

---

## 미완료 작업 (다음 세션에서 처리)

### OG 이미지 프록시 구조 문제 (중요)

현재 기사 페이지의 og:image가 프록시를 거침:
```
https://headlines.fazr.co.kr/api/og-image?url={외부이미지URL}
```

문제:
1. 이중 홉(Twitter → 프록시 → 외부CDN → 프록시 → Twitter)으로 지연 발생
2. Twitter 크롤러가 2~3초에 포기 → 이미지 안 뜸
3. 프록시 실패 시 redirect → Twitter가 redirect를 안 따라감

해결 방향:
- `src/app/news/[slug]/page.tsx`의 `generateMetadata`에서 프록시 URL 대신 `article.image_url`을 직접 사용
- 이미지 없는 경우만 fallback PNG 사용

수정 대상: `src/app/news/[slug]/page.tsx` 24행, 한 줄 변경

현재:
```typescript
const ogImage = article.image_url
  ? `https://headlines.fazr.co.kr/api/og-image?url=${encodeURIComponent(article.image_url)}`
  : "https://headlines.fazr.co.kr/Headlines_Fazr_OG_image.png";
```

변경 후:
```typescript
const ogImage = article.image_url || "https://headlines.fazr.co.kr/Headlines_Fazr_OG_image.png";
```

리스크: 없음 (메타 태그만 변경, SEO 구조 변경 아님)

---

## 보류 중인 작업 (3~4주 후)

상세: `REVIEW-AI-SEARCH-2026-03-25.md`

실행 트리거:
- impressions 3일 이상 정체
- 색인 수 증가 멈춤
- 특정 페이지 CTR 0 유지

수정 우선순위:
1. /category/:slug → /topic/:slug 301 리다이렉트
2. /topic/ai ilike %ai% 제거 (false positive 해결)
3. /ai 페이지 필터 또는 타이틀 수정

---

## 수정 금지 (항상)

- `src/lib/articles.ts`
- `src/app/api/news-ingest/route.ts`
- Supabase schema
- DB 구조, API 구조, URL 구조, 아키텍처

---

## 참고 문서

| 문서 | 용도 |
|------|------|
| `CLAUDE.md` | 프로젝트 SSOT (운영 지시서) |
| `GPT-HANDOFF-2026-03-20.md` | GPT용 프로젝트 전체 핸드오프 |
| `GPT-AI-SEARCH-REVIEW-2026-03-25.md` | GPT용 AI 검색 문제 분석 |
| `REVIEW-AI-SEARCH-2026-03-25.md` | Claude용 AI 검색 문제 분석 |
| `OG_WEBP_ISSUE_REPORT.md` | OG WebP 이슈 분석 (해결 완료) |
