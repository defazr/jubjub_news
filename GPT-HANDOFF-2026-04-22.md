# Headlines Fazr — GPT 핸드오프 (2026-04-22 최종)

## 프로젝트 기본 정보

- 사이트: https://headlines.fazr.co.kr
- 호스팅: Netlify Free (Pro → Free 다운그레이드 완료)
- DB: Supabase (PostgreSQL)
- DNS: Cloudflare Active (Bot Fight Mode OFF)
- 도메인: 가비아 (NS만 Cloudflare)
- 아키텍처: RapidAPI → /api/news-ingest → Claude AI summary → Supabase → Next.js ISR
- Cron: ingest 매 2시간 정각 + og:image 매시간 :30

## 역할 분담

- GPT: 계획 및 지시서 초안
- Claude (채팅): 검증, 판단, 지시서 보완
- Claude Code: 실제 코드 작업, 배포
- 본인: 최종 결정, Supabase SQL, Cloudflare 대시보드, Netlify 모니터링

## 사용자 커뮤니케이션 원칙

- 한국어 대화
- 일방적 종료/스케줄 멘트 금지 — 사용자가 결정
- 과도한 사과 금지, 사실과 해결책 중심
- 추측 ��지, 확인 후 답변
- 노션 업데이트는 명시적 요청 시에만

---

## 이번 세션(4/22) 전체 작업 — Phase 0 출혈 차단

### 근본 원인 (확정)

RapidAPI news-api14 v2가 `excerpt`, `thumbnail` 필드를 응답에서 제거.
현재 응답 필드: title, url, date, publisher, language, paywall, contentLength만 존재.
4/15 이후 모든 신규 기사가 excerpt/image_url/summary NULL로 저장되던 상황.

---

### 1단계: Cron 403 해결 ✅

**문제:** Cloudflare Bot Fight Mode가 GitHub Actions cron 차단 (403)
**해결:** curl에 실제 Chrome UA 위장 + Bot Fight Mode OFF

| 커밋 | 내용 | 결과 |
|------|------|------|
| `96083aa` | UA "HeadlinesFazrCron/1.0" | 실패 (봇 자백) |
| `fbad8fe` | UA 실제 Chrome 120 | 성공 (200) |

### 2단계: Summary 품질 강화 ✅

**3중 방어 구조:**

| 가드 | 위치 | 동작 |
|------|------|------|
| 1차 | AI 응답 직후 | 빈 응답/거부 패턴 → fallback |
| 2차 | 품질 필터 | 메타코멘트 13개 regex → fallback |
| 3차 | DB INSERT 직전 | NULL/빈 문자열 최종 차단 + warn 로그 |

**추가:**
- title-only 프롬���트 전면 교체 (메타코멘트 차단, 영어 유지)
- `isPoorQualitySummary()` — "does not specify", "it is unclear" 등 13패턴
- `cleanMarkdown()` — #, **, *, 리스트 마커, 인라인 코드 제거
- `generateFallbackSummary(title)` → `${title}.` (영어)
- **summary NULL 저장 절대 금지** — 모든 경로에 fallback

| 커밋 | 내용 |
|------|------|
| `de972e9` | 프롬프트 + fallback + NULL 금지 |
| `76567d5` | 3중 가드 + 마크다운 후처리 |

**중요 결정: 영어 유지.**
- Claude Code가 GPT의 한국어 프롬프트 제안을 거부 (정확한 판단)
- DB 3000+건 영어 일관성 + GSC 색인 언어 보호

### 3단��: DB 오염 파악 ✅

- USA TODAY 카테고리 페이지: ~155건
- AI 거부 응답 ("I cannot", "unable to" 등): ~140건
- 총 약 228건 오염 데이터 DB 잔존
- 백업 테이블: `articles_backup_20260422_phase0_delete`

### 4단계: DELETE ⏸ (다음 세션)

- 피로 상태에서 DELETE 위험 → 연기
- contentFilter가 출력 레이어에서 차단 중이라 사용자 노출 없음
- 다음 세션에서 차분히 검증 후 실행

### 5단계: 카테고리 페이지 사전 차단 ✅

- `src/lib/articleFilter.ts`에 `AGGREGATOR_PATTERNS` 8개 추가
- RapidAPI `contentLength` 전달 (<400 자동 스킵)
- 커밋: `0e19fd7`

### 보너스: og:image 추출 시스템 ✅

**완전 독립 시스템 (ingest 수정 0):**

| 파일 | 역할 |
|------|------|
| `src/lib/ogImageExtractor.ts` | og:image 추출 (3초 timeout, head 20KB) |
| `src/app/api/extract-og-images/route.ts` | API 엔드포인트 (순차, limit=30) |
| `.github/workflows/og-image-extract.yml` | 매시간 :30 cron |

**테스트 결과:** 60% 추출 성공, 에러 0건, 4초 소요
**효과:** 기사 들어온 후 최대 1시간 내 진짜 이미지로 자동 교체

커밋: `162fb0d`

### 보너스: Netlify Pro → Free 다운그레이드

- 월 $19 절약 (월 $30 → $11)

---

## 커밋 전체 이력 (이번 세션)

| 커밋 | 내용 |
|------|------|
| `6582472` | Cache-Control 헤더 추가 |
| `ed14fee` | ingest 복구 (RapidAPI 스펙 대응) |
| `ba81a15` | backfill 복구 (동일) |
| `96083aa` | Cron UA 추가 (실패) |
| `fbad8fe` | Cron UA Chrome 위장 (성공) |
| `de972e9` | 프롬프트 + fallback + NULL 금지 |
| `76567d5` | 3중 가드 + 마크다운 후처리 |
| `0e19fd7` | 카테고리 ��전 차단 |
| `162fb0d` | og:image 독립 추출 시스템 |

---

## 현재 시스템 상태

| 항목 | 상태 |
|---|---|
| 기사 수 | 3,588 |
| summary NULL | 2건 (사실상 0) |
| image_url NULL | ~246건 → cron 자동 감소 중 |
| 파이프라인 | 정상 (ingest + summary + og:image) |
| Cron ingest | 매 2시간 정각, Response 200 |
| Cron og:image | 매시간 :30, 30건씩 |
| Cloudflare | Active, Bot Fight Mode OFF |
| Netlify | Free 플랜 |
| GSC | 색인 389p, 클릭 4, 노출 44 |

### DB 오염 잔존 (4단계 미실행)

- USA TODAY 카테고리: ~155건
- AI 거부 응답: ~140건
- contentFilter가 출력에서 차단 → 사용자 노출 없음
- 다음 세션에서 DELETE 예정

---

## 핵심 원칙 (이번 사건 교훈)

1. **외부 API 절대 신뢰 금지** — optional + fallback 필수
2. **ingest는 외부 의존하지 않는 구조** — og:image 등 부가 처리는 별도 시스템
3. **summary 영어 유지** — 한국어 혼재 = SEO 학습 혼란
4. **복구율 20% 이하 수렴 = 종료**
5. **순서 엄수**: 코드 수정 → 배포 → 검증 → DB 정리
6. **DELETE 전 백업 필수 + 피로 시 연기**
7. **Bot Fight Mode + cron = 충돌** (UA 위장 또는 OFF)

---

## 다음 세션에서 할 것

### 1. 4단계 DELETE (필수)

```sql
-- 먼저 건수 재확인
SELECT COUNT(*) FROM articles_backup_20260422_phase0_delete;

-- 삭제 (백업 이미 존재)
DELETE FROM articles
WHERE id IN (SELECT id FROM articles_backup_20260422_phase0_delete);
```

### 2. og:image 결과 확인

```sql
SELECT
  COUNT(*) FILTER (WHERE image_url IS NULL) AS still_null,
  COUNT(*) FILTER (WHERE image_url IS NOT NULL) AS have_image
FROM articles;
```

예상: still_null 30~80건 (추출 불가 사이트만 남음)

### 3. 6개월 관망 모드 진입

- 매달 GSC만 5분 확인
- 코드 건드리지 않음
- 다음 액션 트리거: organic 20+, 클릭 10+, CTR 정체

---

## 수정 금지 파일

- `src/lib/articles.ts` (절대)
- `src/app/api/news-ingest/route.ts` (다시 수정 금지)
- `src/app/api/backfill-summaries/route.ts` (다시 수정 금지)
- Supabase schema (절대)
- DB/API/URL/아키��처 구조
- CORE_KEYWORDS 배열

---

## DB 참고

### articles 컬럼 (13개)
id, title, slug, summary, excerpt, source_url, image_url, publisher, category, keywords, published_at, created_at, source_hash

### 백업 테이블
- `articles_backup_20260416`
- `articles_backup_20260417`
- `articles_backup_20260422` (571건)
- `articles_backup_20260422_phase0_delete` (228건, 4단계 DELETE 대상)

### RapidAPI
- Host: `news-api14.p.rapidapi.com`
- Endpoints: `/v2/search/articles`, `/v2/trendings`
- 현재 응답: title, url, language, paywall, contentLength, date, publisher

---

## GSC 현황 (4/14 기준)
- 색인: 389페이지
- 미색인: 199
- 클릭: 4 / 노출: 44
- 한국 CTR: 44%
- 단계: 테스트 노출 (정상)

---

## Cloudflare
- NS: `darl.ns.cloudflare.com`, `meiling.ns.cloudflare.com`
- 롤백 NS: `ns.gabia.co.kr`, `ns1.gabia.co.kr`, `ns.gabia.net`
- Bot Fight Mode: OFF (cron 호환 위해)
- WAF Rule 1: Block SG bots (Managed Challenge)
- Rule 2,3: 미완 (급하지 않음)

---

## 참고 문서

| 문서 | 용도 |
|------|------|
| `CLAUDE.md` | 프로젝트 SSOT (운영 지시서 v1.2) |
| `SESSION-HANDOFF-2026-04-22.md` | Claude 세션 핸드오프 |
| `GPT-HANDOFF-2026-04-06.md` | 이전 핸드오프 (콘텐�� 필터) |
