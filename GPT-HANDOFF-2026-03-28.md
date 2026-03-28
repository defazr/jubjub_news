# Headlines Fazr — GPT 핸드오프 (2026-03-28)

## 이번 세션 작업 요약

### 1. OG 이미지 프록시 제거 (완료, 배포됨)

**문제:**
- `src/app/news/[slug]/page.tsx`의 `generateMetadata`에서 og:image가 프록시(`/api/og-image?url=...`)를 경유
- 이중 홉으로 Twitter 크롤러 타임아웃 → 카드 이미지 안 뜸

**1차 수정 (커밋 `e5d43fd`):**
```typescript
// Before: 프록시 경유
const ogImage = article.image_url
  ? `https://headlines.fazr.co.kr/api/og-image?url=${encodeURIComponent(article.image_url)}`
  : "https://headlines.fazr.co.kr/Headlines_Fazr_OG_image.png";

// After: 직접 URL
const ogImage = article.image_url || "https://headlines.fazr.co.kr/Headlines_Fazr_OG_image.png";
```

### 2. WebP 필터링 추가 (완료, 배포됨)

**문제:**
- 1차 수정 후에도 Twitter에서 이미지 안 뜸
- 원인: 외부 이미지가 WebP → Twitter/X는 WebP 지원 불안정

**2차 수정 (커밋 `8944cbc`):**
```typescript
const ogImage = article.image_url && !article.image_url.endsWith('.webp')
  ? article.image_url
  : "https://headlines.fazr.co.kr/Headlines_Fazr_OG_image.png";
```

**결과:**
| 이미지 형식 | Twitter | Facebook |
|---|---|---|
| JPG/PNG | 원본 이미지 표시 | 원본 이미지 표시 |
| WebP | fallback PNG | 원본 이미지 표시 (WebP 지원) |
| 없음 | fallback PNG | fallback PNG |

**참고:** Facebook은 OG 캐시가 강함 → 변경 후 [Sharing Debugger](https://developers.facebook.com/tools/debug/)에서 "Scrape Again" 필요

---

## 현재 시스템 상태

- 기사 수: 1,818+
- 파이프라인: 정상 (24시간 116건 수집)
- 배포: Netlify, main 브랜치 자동 배포
- TypeScript 에러: 0

---

## 알려진 제한사항

1. **URL에 .webp 확장자 없이 WebP로 서빙되는 경우** — 감지 불가, 현실적으로 무시 (HEAD 요청은 속도/복잡도 문제)
2. **프록시 + WebP→JPG 변환** — 서버리스 10초 제한으로 502 위험, 하지 않음

---

## 보류 중인 작업 (변경 없음)

SESSION-HANDOFF-2026-03-28.md 참고:
1. /category/:slug → /topic/:slug 301 리다이렉트
2. /topic/ai ilike %ai% 제거
3. /ai 페이지 필터 또는 타이틀 수정

실행 트리거: impressions 3일 정체, 색인 수 증가 멈춤, CTR 0 유지

---

## 수정 금지 (항상)

- `src/lib/articles.ts`
- `src/app/api/news-ingest/route.ts`
- Supabase schema
- DB/API/URL/아키텍처 구조

---

## 작업 환경

- Claude Code 앱 → `claude/review-markdown-files-Pawh5` 브랜치 (리뷰/검토)
- Claude Code 터미널 → `main` 브랜치 직접 커밋 (배포)
- GPT → 검토/판단/전략
