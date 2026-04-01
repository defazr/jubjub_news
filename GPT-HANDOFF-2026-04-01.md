# Headlines Fazr — GPT 핸드오프 (2026-04-01)

## 이번 세션 작업 요약

### ISR revalidate 간격 전체 상향 (완료, 배포됨)

**문제:**
- Netlify ISR writes 200K/월 초과 → 프로젝트 pause 위험
- 원인: homepage 60초, category 300초, topic 300초 등 짧은 revalidate 간격
- ISR on-demand 특성상 접근 시마다 write 발생, 봇+트래픽으로 폭증

**수정 내용 (커밋 `37a3540`, 배포 완료):**

| 페이지 | 이전 | 변경 후 |
|---|---|---|
| homepage | 60s | 900s (15분) |
| category × 7 | 300s | 1800s (30분) |
| topic/[keyword] | 300s | 3600s (1시간) |
| trending | 600s | 1800s (30분) |
| trending-keywords API | 600s | 1800s (30분) |
| news-status API | 300s | 3600s (1시간) |
| article | 3600s | 유지 |
| digest | 3600s | 유지 |

**수정 파일 (14개):**
- `src/app/page.tsx`
- `src/app/category/{culture,tech,world,opinion,politics,economy,society,sports}/page.tsx` (7개)
- `src/app/topic/[keyword]/page.tsx`
- `src/app/trending/page.tsx`
- `src/app/api/trending-keywords/route.ts`
- `src/app/api/news-status/route.ts`
- `CLAUDE.md` (캐시 정책 업데이트, "수정 금지" 해제)

**CLAUDE.md 변경사항:**
- 캐시 정책 "수정 금지" → "예외 허용" (ISR writes 초과 안정화 작업)
- 캐시 정책 테이블 이전/현재 값으로 업데이트

---

## 이전 세션 작업 (2026-03-28, 완료)

- OG 이미지 프록시 제거 + WebP 필터링 (`8944cbc`)
- GA4 데이터 분석 (Google 크롤링 시작 단계 확인)
- 상세: `GPT-HANDOFF-2026-03-28.md`

---

## 현재 시스템 상태

- 기사 수: 1,818+
- 파이프라인: 정상 (24시간 116건 수집)
- 배포: Netlify, main 브랜치 수동 배포 (auto build 끔 → 필요 시 Activate builds)
- CLAUDE.md: v1.2
- ISR writes: 감소 모니터링 중

---

## 모니터링 항목

1. **ISR writes** — Netlify 대시보드에서 감소 추이 확인
2. **Google organic** — 7 → 20 → 50 증가 여부 (Search Console)
3. **Impressions** — 0 → 10 → 100 증가 여부

---

## 다음 페이즈 진입 신호

다음 중 하나 발생 시 "다음 단계" 시작:
1. google organic 20+ 도달
2. 특정 글 클릭 발생
3. impressions 눈에 띄게 증가

그때 할 일:
1. AI 필터 정리
2. topic 정제
3. CTR 개선

---

## 보류 중인 작업 (변경 없음)

1. /category/:slug → /topic/:slug 301 리다이렉트
2. /topic/ai ilike %ai% 제거
3. /ai 페이지 필터 또는 타이틀 수정

---

## 수정 금지 (항상)

- `src/lib/articles.ts`
- `src/app/api/news-ingest/route.ts`
- Supabase schema
- DB/API/URL/아키텍처 구조

---

## 참고 문서

| 문서 | 용도 |
|------|------|
| `CLAUDE.md` | 프로젝트 SSOT (운영 지시서 v1.2) |
| `SESSION-HANDOFF-2026-04-01.md` | Claude 세션 핸드오프 |
| `GPT-HANDOFF-2026-03-28.md` | 이전 GPT 핸드오프 |
| `GPT-HANDOFF-2026-03-20.md` | 최초 GPT 핸드오프 |
| `REVIEW-AI-SEARCH-2026-03-25.md` | AI 검색 문제 분석 (보류) |
