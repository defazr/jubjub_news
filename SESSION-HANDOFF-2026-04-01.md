# Headlines Fazr — 세션 핸드오프 (2026-04-01)

## 현재 상태

- 사이트: https://headlines.fazr.co.kr
- 브랜치: `main` (Claude Code 터미널에서 직접 커밋)
- 기사 수: 1,818+
- 파이프라인: 정상 운영 중
- 단계: Google Discover 진입 대기 + ISR writes 모니터링

---

## 이번 세션에서 한 작업

### 1. ISR revalidate 간격 전체 상향 (완료, 배포됨)

Netlify ISR writes 200K/월 초과 위험 → revalidate 간격 증가로 writes 감소.

변경 파일 (14개):
- `src/app/page.tsx` — 60s → 900s
- `src/app/category/*/page.tsx` × 7 — 300s → 1800s
- `src/app/topic/[keyword]/page.tsx` — 300s → 3600s
- `src/app/trending/page.tsx` — 600s → 1800s
- `src/app/api/trending-keywords/route.ts` — 600s → 1800s
- `src/app/api/news-status/route.ts` — 300s → 3600s
- `CLAUDE.md` — 캐시 정책 업데이트

커밋: `37a3540`

---

## 이전 세션 작업 (2026-03-28, 완료)

### OG 이미지 프록시 제거 + WebP 필터링

- 프록시(`/api/og-image?url=...`) 제거, 직접 CDN URL 사용
- WebP → fallback PNG (Twitter 미지원 대응)
- 커밋: `e5d43fd`, `8944cbc`

### GA4 데이터 분석

- 활성 사용자 87명 (전원 신규)
- Google organic 시작 단계 (약 24 세션)
- 구조 변경 금지 확인

---

## 미완료 작업

없음. 현재 대기 상태.

---

## 모니터링 항목

1. **ISR writes** — Netlify 대시보드에서 감소 추이
2. **Google organic** — Search Console에서 증가 여부
3. **Impressions** — 증가 추이

---

## 다음 페이즈 진입 신호

1. google organic 20+ 도달
2. 특정 글 클릭 발생
3. impressions 눈에 띄게 증가

→ 그때 AI 필터 정리 + topic 정제 + CTR 개선 시작

---

## 보류 중인 작업 (변경 없음)

실행 트리거 충족 시:
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
| `CLAUDE.md` | 프로젝트 SSOT (운영 지시서 v1.2) |
| `GPT-HANDOFF-2026-04-01.md` | GPT용 핸드오프 (이번 세션) |
| `GPT-HANDOFF-2026-03-28.md` | GPT용 핸드오프 (이전) |
| `REVIEW-AI-SEARCH-2026-03-25.md` | AI 검색 문제 분석 (보류) |
