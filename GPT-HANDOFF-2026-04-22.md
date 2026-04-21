# Headlines Fazr — GPT 핸드오프 (2026-04-22)

## 이번 세션 작업 요약

### 긴급 복구: RapidAPI v2 스펙 변경 대응 (완료, 배포됨)

**문제:**
- 4/15 이후 신규 기사 571건 전부 excerpt/image_url/summary NULL
- 처음에는 Netlify Functions 다운타임(4/15~4/16)이 원인으로 추정
- **실제 원인**: RapidAPI news-api14 v2가 `excerpt`, `thumbnail` 필드를 응답에서 제거
- curl로 직접 API 호출하여 확정 — 현재 응답 필드: `title, url, language, paywall, contentLength, date, publisher`만 존재

**영향 범위:**
- ingest: excerpt 없어서 summary 생성 스킵 → 모든 신규 기사 summary NULL
- backfill: `.not("excerpt", "is", null)` 조건 때문에 해당 기사 못 찾음
- image: thumbnail 필드 없어서 image_url 전부 NULL

---

### 작업 1: Cache-Control 헤더 추가 (커밋 `6582472`)

**파일:**
- `src/app/api/news-status/route.ts`
- `src/app/api/trending-keywords/route.ts`

**변경:** `Cache-Control: public, max-age=300, stale-while-revalidate=600`
- Functions 호출 줄이기 목적 (봇 트래픽 대응)

---

### 작업 2: news-ingest 복구 (커밋 `ed14fee`)

**파일:** `src/app/api/news-ingest/route.ts` (수정 금지 해제하여 긴급 수정)

**변경 내용:**
1. `RawArticle` 인터페이스: `excerpt`, `thumbnail` → optional (`?`)
2. `generateSummaryAndKeywords` 시그니처: `excerpt: string` → `excerpt: string | null`
3. `!excerpt` 조건 제거 — excerpt 없어도 title만으로 summary 생성 진행
4. title-only 프롬프트 추가 (추측 금지, 사실만 요약하도록 가이드)
5. `isFailedSummary()` 함수 추가 — "I cannot", "I can't", "unable to" 등 패턴 감지 → null 반환
6. `[SUMMARY]` 로깅 추가 (success/failed_pattern/failed_other)

**프롬프트 분기:**
- excerpt 있음 → 기존 프롬프트 유지 (Title + Excerpt)
- excerpt 없음 → title-only 프롬프트:
  - 30-50단어로 축소
  - "제목에서 명확히 알 수 있는 사실만 요약"
  - 추측/일반론/과장 금지

---

### 작업 3: backfill-summaries 복구 (커밋 `ba81a15`)

**파일:** `src/app/api/backfill-summaries/route.ts`

**변경 내용 (ingest와 동일):**
1. `.not("excerpt", "is", null)` 필터 제거 → excerpt NULL 기사도 대상에 포함
2. `generateSummaryAndKeywords` 동일 수정 (title-only, 실패 패턴 필터)
3. `[BACKFILL]` 로깅 추가

---

### 작업 4: 데이터 복구 (Supabase 직접 실행)

**실행 순서:**
1. 백업: `articles_backup_20260422` 테이블 생성 (571건)
2. backfill 수동 실행 (limit=50, 여러 회)
3. 복구 결과: 571건 중 298건 성공 (52%)
4. 성공률 20% 이하로 수렴 → 복구 종료 판단
5. 남은 373건 삭제 (복구 불가 — 제목 품질 너무 낮음)
6. 최종: summary NULL = 2건 (사실상 0)

**backfill 성공률 추이:**
| 회차 | 성공/시도 | 비율 |
|------|-----------|------|
| 1회 | 45/50 | 90% |
| 2회(limit=200) | ~221건 | 502 터짐, 일부 저장 |
| 3회 | 12/50 | 24% |
| 4회 | 11/50 | 22% |
| 5회 | 11/50 | 22% |
| 6회 | 8/50 | 16% |

→ 20% 이하 수렴 = 복구 한계 도달

---

## 진단 과정 (향후 참고)

1. `/api/news-status` 확인 → 파이프라인 정상, 환경변수 정상
2. GitHub Actions cron 확인 → 10회 전부 성공, `summarize=true` 포함
3. `/api/news-ingest?action=test` → Supabase OK, RapidAPI OK, Anthropic OK (status 200)
4. Supabase 직접 확인 → 4/15 이후 전부 excerpt NULL 확인
5. RapidAPI 직접 curl → **excerpt/thumbnail 필드 자체가 없음** ← 근본 원인 확정
6. backfill이 "All articles already have summaries" 반환 → `.not("excerpt", "is", null)` 필터 때문

**핵심 교훈:** 외부 API 필드를 절대 신뢰하지 말 것. optional 처리 + fallback 필수.

---

## 현재 시스템 상태

| 항목 | 상태 |
|---|---|
| 기사 수 | ~3,500 (373건 삭제 후) |
| summary NULL | 2건 (사실상 0) |
| 파이프라인 | 정상 (ingest + summary 생성 정상화) |
| Netlify | Pro 플랜, 자동 배포 ON |
| GSC | 색인 389p, 클릭 4, 노출 44 |
| Cloudflare | DNS 이전 진행 중 (봇 차단 목적) |
| 백업 | `articles_backup_20260422` (571건) |

---

## 현재 이슈

### 이슈 1: 이미지 없음 (보류)
- RapidAPI가 thumbnail 미제공 → 근본적 해결 불가
- fallback 이미지(`Headlines_Fazr_OG_image.webp`)로 대체 중
- API 교체 시 해결 예정

### 이슈 2: 싱가포르 봇 트래픽 (진행 중)
- GA4: 싱가포르 347명 (참여율 0% = 봇)
- 이 봇이 Functions 한도 먹어서 4/15 다운 발생
- Cloudflare DNS 이전 + 봇 차단 룰 설정 진행 중

---

## 수정 금지 (항상)

- `src/lib/articles.ts`
- `src/app/api/news-ingest/route.ts` (4/22 긴급 복구 완료 → 다시 수정 금지)
- `src/app/api/backfill-summaries/route.ts` (4/22 긴급 복구 완료 → 다시 수정 금지)
- Supabase schema
- DB/API/URL/아키텍처 구조
- CORE_KEYWORDS 배열

---

## 보류 중인 작업

1. /category/:slug → /topic/:slug 301 리다이렉트
2. /topic/ai ilike %ai% 제거 (false positive)
3. /ai 페이지 필터 또는 타이틀 수정
4. iphone, 5g sitemap 대소문자 이슈
5. 공백 slug 83개
6. 이미지 — API 교체 또는 스크래핑 검토 (장기)

실행 트리거: impressions 증가 / 클릭 10+ / CTR 정체

---

## 운영 원칙 (이번 세션에서 추가)

- 3~5일간 안정화 관찰 (ingest 정상, summary 생성 정상 확인)
- 코드 건드리지 말 것
- Cloudflare 작업은 코드 무관이라 병행 OK

---

## 참고 문서

| 문서 | 용도 |
|------|------|
| `CLAUDE.md` | 프로젝트 SSOT (운영 지시서 v1.2) |
| `GPT-HANDOFF-2026-04-06.md` | 이전 GPT 핸드오프 (콘텐츠 필터) |
| `SESSION-HANDOFF-2026-04-22.md` | Claude 세션 핸드오프 |
