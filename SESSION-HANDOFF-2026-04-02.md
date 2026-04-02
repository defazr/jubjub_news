# Headlines Fazr — 세션 핸드오프 (2026-04-02)

## 현재 상태

- 사이트: https://headlines.fazr.co.kr
- 브랜치: `main`
- 기사 수: 1,818+
- 파이프라인: 정상 운영 중
- 단계: Google Discover 진입 대기 + ISR writes 모니터링

---

## 이번 세션에서 한 작업

### sitemap-topics.xml 빈 topic 자동 필터링 (완료)

GSC에서 404 보고된 URL 4건 조사 → sitemap 개선.

**1차 (커밋 `1e083ff`):** keywords 필드만 체크 → ai, bitcoin 등 누락 발생
**2차 수정 (커밋 `d992af2`):** topic 페이지와 동일 기준 적용 (`keywords.cs OR title.ilike`)

변경 파일: `src/app/sitemap-topics.xml/route.ts` (이 파일만)

결과:
- gpt5, deepseek → 자동 제외 (기사 0건)
- ai, bitcoin, tesla, crypto 등 핵심 키워드 → 정상 포함
- 총 topic: 229 → 225개

### GSC 404 전수 점검 결과

| URL | HTTP | 기사 수 | sitemap | 처리 |
|-----|------|---------|---------|------|
| /topic/gemini | 200 | 2+ | O | 정상 |
| /topic/gpt5 | 200 | 0 | 제외됨 | 해결 |
| /topic/copilot | 200 | 2+ | O | 정상 |
| /topic/bodo/glimt | 404 | - | X | 보류 (영향 없음) |

---

## 미처리 (보류)

- **iphone, 5g sitemap 누락** — 대소문자 매칭 문제 추정, 영향도 낮아 보류
- **공백 slug 83개** — 유지 (건드리지 않음)
- **/topic/bodo/glimt 404** — sitemap 미포함, 영향 없음

---

## 다음 액션 트리거

1. impressions 증가
2. 클릭 10+
3. CTR 정체

→ 그때 AI 필터 정리 + topic 정제 + CTR 개선 시작

---

## 수정 금지 (항상)

- `src/lib/articles.ts`
- `src/app/api/news-ingest/route.ts`
- Supabase schema
- DB 구조, API 구조, URL 구조, 아키텍처
- CORE_KEYWORDS 배열 자체 수정 금지

---

## 참고 문서

| 문서 | 용도 |
|------|------|
| `CLAUDE.md` | 프로젝트 SSOT (운영 지시서 v1.2) |
| `GPT-HANDOFF-2026-04-02.md` | GPT용 핸드오프 (이번 세션) |
| `SESSION-HANDOFF-2026-04-01.md` | 이전 세션 핸드오프 |
| `REVIEW-AI-SEARCH-2026-03-25.md` | AI 검색 문제 분석 (보류) |
