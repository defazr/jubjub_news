# Headlines Fazr — 세션 핸드오프 (2026-04-22)

## 현재 상��

- 사이트: https://headlines.fazr.co.kr
- 브랜치: `main`
- 기사 수: ~3,500 (373건 삭제 후)
- summary NULL: 2건 (사실상 0)
- 파이프라인: 정상 (ingest + summary 정상화 완료)
- DNS: Cloudflare (Active, Bot Fight Mode ON)
- 단계: 긴급 복구 완료 → 안정화 관찰 중

---

## 이번 세션에서 한 작업

### 1. Cache-Control 헤더 추가 (커밋 `6582472`)

- `/api/news-status`, `/api/trending-keywords`
- `Cache-Control: public, max-age=300, stale-while-revalidate=600`

### 2. ingest 복구 (커밋 `ed14fee`)

- 근본 원인: RapidAPI가 excerpt/thumbnail 필드 제거
- RawArticle 인터페이스 optional 처리
- excerpt 없이 title만으로 summary 생성
- title-only 프롬프트 (추측 금지 가이드)
- `isFailedSummary()` 패턴 필터
- `[SUMMARY]` 로깅

### 3. backfill 복구 (커밋 `ba81a15`)

- ingest와 동일 수정
- `.not("excerpt", "is", null)` 필터 제거
- `[BACKFILL]` 로깅

### 4. 데이터 복구 + 정리

- backfill 실행: 571건 중 298건 복구
- 성공률 20% 이하 수렴 → 복구 종료
- 남은 373건 삭제
- 백업: `articles_backup_20260422`

### 5. Cloudflare 이전 + 봇 차단

- Cloudflare DNS 이전 완료 (Active)
- NS: `darl.ns.cloudflare.com`, `meiling.ns.cloudflare.com`
- 롤백용 가비아 NS: `ns.gabia.co.kr`, `ns1.gabia.co.kr`, `ns.gabia.net`
- WAF Rule 1: Block SG bots (Managed Challenge) 배포 완료
- Bot Fight Mode: ON, 브라우저 무결성 검��: ON

---

## 커밋 이력 (이번 세션)

| 커밋 | 내용 |
|------|------|
| `6582472` | Cache-Control 헤더 추가 |
| `ed14fee` | ingest 복구 (RapidAPI 스펙 변경 대응) |
| `ba81a15` | backfill 복구 (동일 수정) |
| `6a763b8` | 핸드오�� 문서 추가 |

---

## 현재 한계

- **Summary 길이**: 150~200자 (이전 300~500자) — title만 기반이라 한계
- **이미지**: 모든 신규 기사 fallback (RapidAPI thumbnail 미제공)

---

## 남은 작업

### Cloudflare (미완료)

- Rule 2: `/topic` 경로 JS Challenge
- Rule 3: `/api/` 경로 JS Challenge

### 안정화 기간 (3~5일)

코드 건드리지 말 것:
- ingest 정상 동작 확인
- summary 생성 정상 확인
- Cloudflare 봇 차단 효과 확인

### 이후

- og:image 추출 구현 (기사 URL에서 og:image 메타태그 스크래핑)
- RapidAPI 교체 검토 (장기)

---

## 수정 금지 (항상)

- `src/lib/articles.ts`
- `src/app/api/news-ingest/route.ts` (긴급 복구 완료 → 다시 수정 금지)
- `src/app/api/backfill-summaries/route.ts` (긴급 복구 완료 → 다시 수정 금지)
- Supabase schema
- DB/API/URL/아키텍처 구조
- CORE_KEYWORDS 배열

---

## DB 참고

- 컬럼: id, title, slug, summary, excerpt, source_url, image_url, publisher, category, keywords, published_at, created_at, source_hash
- 백업: `articles_backup_20260416`, `articles_backup_20260417`, `articles_backup_20260422`

---

## 참고 문서

| 문서 | 용도 |
|------|------|
| `CLAUDE.md` | 프로젝트 SSOT (운영 지시서 v1.2) |
| `GPT-HANDOFF-2026-04-22.md` | GPT용 핸드오프 (이번 세션) |
| `SESSION-HANDOFF-2026-04-06.md` | 이전 세션 핸드오프 |
