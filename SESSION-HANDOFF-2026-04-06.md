# Headlines Fazr — 세션 핸드오프 (2026-04-06)

## 현재 상태

- 사이트: https://headlines.fazr.co.kr
- 브랜치: `main`
- 기사 수: 2,616+
- 파이프라인: 정상 운영 중
- 단계: Google Discover 진입 대기 + 콘텐츠 품질 개선

---

## 이번 세션에서 한 작업

### 출력 레이어 콘텐츠 필터 (완료, 배포됨)

USA TODAY 껍데기 기사 중복 + AI 실패 summary 대응.

신규 파일: `src/lib/contentFilter.ts`
- boilerplate 제거 (normalizeTitle 기준)
- title dedup (normalized title Set)
- failed summary 처리 (AI 페이지: 제외 / 나머지: null 처리)

적용: 홈페이지, AI, topic, category × 7 (총 11 페이지)
커밋: `75a1698`

### 사전 확인

- GSC 404 4건 확인 → gemini/copilot 정상, gpt5 sitemap 제외됨(4/2), bodo/glimt 보류
- DB 실패 summary: 표면 미발견 (예방 차원 필터 적용)
- USA TODAY 중복: 홈 5건, /topic/world 11건 → 필터로 제거

---

## ISR 캐시 참고

배포 직후에는 이전 캐시 서빙. 반영 시간:
- 홈페이지: 15분
- category: 30분
- topic: 1시간

---

## 보류 중인 작업

1. /category/:slug → /topic/:slug 301 리다이렉트
2. /topic/ai ilike %ai% 제거
3. /ai 페이지 필터 또는 타이틀 수정
4. iphone, 5g sitemap 대소문자 이슈
5. 공백 slug 83개

실행 트리거: impressions 증가 / 클릭 10+ / CTR 정체

---

## 수정 금지 (항상)

- `src/lib/articles.ts`
- `src/app/api/news-ingest/route.ts`
- Supabase schema
- DB/API/URL/아키텍처 구조
- CORE_KEYWORDS 배열

---

## 참고 문서

| 문서 | 용도 |
|------|------|
| `CLAUDE.md` | 프로젝트 SSOT (운영 지시서 v1.2) |
| `GPT-HANDOFF-2026-04-06.md` | GPT용 핸드오프 (이번 세션) |
| `SESSION-HANDOFF-2026-04-02.md` | 이전 세션 핸드오프 |
