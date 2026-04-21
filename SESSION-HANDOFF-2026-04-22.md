# Headlines Fazr — 세션 핸드오프 (2026-04-22)

## 현재 상태

- 사이트: https://headlines.fazr.co.kr
- 브랜치: `main`
- 기사 수: ~3,500 (373건 삭제 후)
- summary NULL: 2건 (사실상 0)
- 파이프라인: 정상 (ingest + summary 정상화 완료)
- 단계: 긴급 복구 완료 → 안정화 관찰 중

---

## 이번 세션에서 한 작업

### 1. Cache-Control 헤더 추가 (커밋 `6582472`)
- `/api/news-status`, `/api/trending-keywords`에 `Cache-Control: public, max-age=300, stale-while-revalidate=600`
- Functions 호출 줄이기 목적

### 2. RapidAPI 스펙 변경 대응 — ingest 복구 (커밋 `ed14fee`)
- 근본 원인: RapidAPI가 excerpt/thumbnail 필드 제거
- RawArticle 인터페이스 optional 처리
- excerpt 없이 title만으로 summary 생성
- title-only 프롬프트 (추측 금지 가이드)
- isFailedSummary() 패턴 필터
- [SUMMARY] 로깅

### 3. backfill-summaries 복구 (커밋 `ba81a15`)
- ingest와 동일 수정
- `.not("excerpt", "is", null)` 필터 제거

### 4. 데이터 복구
- backfill 실행: 571건 중 298건 복구
- 성공률 20% 이하 수렴 → 복구 종료
- 남은 373건 삭제
- 백업: `articles_backup_20260422`

---

## 커밋 이력 (이번 세션)

| 커밋 | 내용 |
|------|------|
| `6582472` | Cache-Control 헤더 추가 |
| `ed14fee` | ingest 복구 (RapidAPI 스펙 변경 대응) |
| `ba81a15` | backfill 복구 (동일 수정) |

---

## 현재 이슈

1. **이미지 없음** — RapidAPI thumbnail 미제공, fallback 사용 중 (보류)
2. **봇 트래픽** — Cloudflare DNS 이전 진행 중 (본인 직접)

---

## 안정화 기간

3~5일간 코드 건드리지 말 것:
- ingest 정상 동작 확인
- summary 생성 정상 확인
- Cloudflare 봇 차단 효과 확인

---

## 수정 금지 (항상)

- `src/lib/articles.ts`
- `src/app/api/news-ingest/route.ts` (긴급 복구 완료 → 다시 수정 금지)
- `src/app/api/backfill-summaries/route.ts` (긴급 복구 완료 → 다시 수정 금지)
- Supabase schema
- DB/API/URL/아키텍처 구조
- CORE_KEYWORDS 배열

---

## 보류 중인 작업

1. /category/:slug → /topic/:slug 301 리다이렉트
2. /topic/ai ilike %ai% 제거
3. /ai 페이지 필터 또는 타이틀 수정
4. iphone, 5g sitemap 대소문자 이슈
5. 공백 slug 83개
6. 이미지 — API 교체 검토 (장기)

실행 트리거: impressions 증가 / 클릭 10+ / CTR 정체

---

## 참고 문서

| 문서 | 용도 |
|------|------|
| `CLAUDE.md` | 프로젝트 SSOT (운영 지시서 v1.2) |
| `GPT-HANDOFF-2026-04-22.md` | GPT용 핸드오프 (이번 세션) |
| `SESSION-HANDOFF-2026-04-06.md` | 이전 세션 핸드오프 |
