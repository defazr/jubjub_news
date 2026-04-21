# Headlines Fazr — GPT 핸드오프 (2026-04-22)

## 프로젝트 기본 정보

- 사이트: https://headlines.fazr.co.kr
- 호스팅: Netlify Pro (4/16 업그레이드, 4/16~5/15 결제 주기)
- DB: Supabase (PostgreSQL)
- DNS: Cloudflare (4/22 이전 완료, Active 상태)
- 도메인 등록: 가비아 (네임서버만 Cloudflare로 변경)
- 아키텍처: RapidAPI → /api/news-ingest → Claude AI summary → Supabase → Next.js ISR
- GitHub Actions Cron: summarize=true 파라미터로 정기 ingest

## 역할 분담

- GPT: 계획 및 지시서 초안
- Claude (채팅): 검증, 판단, 지시서 보완, 사실 확인
- Claude Code: 실제 코드 작업, 배포, 터미널 명령
- 본인: 최종 결정, Supabase SQL 직접 실행, Cloudflare 대시보드 작업, Netlify 모니터링

---

## 이번 세션(4/22) 완료 작업

### 1. ingest 복구 (커밋 `ed14fee`)

**파일:** `src/app/api/news-ingest/route.ts` (원래 수정 금지였으나 예외 적용)

**원인:** RapidAPI v2 응답에서 excerpt, thumbnail 필드가 사라짐
(현재 응답 필드: title, url, date, publisher, language, paywall, contentLength)

**수정 내용:**
- RawArticle 인터페이스: excerpt, thumbnail → optional
- generateSummaryAndKeywords: `excerpt: string | null`로 시그니처 변경
- `!excerpt` 스킵 조건 제거 → title만으로 summary 생성
- title-only 프롬프트 추가 ("제목에서 명확히 알 수 있는 사실만 요약. 추측/일반론/과장 금지")
- `isFailedSummary()` 필터 추가 (Claude AI 거부 응답 차단: "I cannot", "I can't", "unable to" 등)
- `[SUMMARY]` 로깅 추가 (success, failed_pattern, failed_other 카운트)

### 2. backfill 복구 (커밋 `ba81a15`)

**파일:** `src/app/api/backfill-summaries/route.ts`

**동일한 수정:**
- `.not("excerpt", "is", null)` 조건 제거 → excerpt NULL 기사도 대상에 포함
- `!excerpt` 스킵 제거
- title-only 프롬프트 적용
- `isFailedSummary()` 필터
- `[BACKFILL]` 로깅

### 3. 기존 571건 데이터 정리

- 4/14 이후 excerpt NULL 기사: 571건 (4/14 46건 + 4/15~4/21 525건)
- 백업 테���블: `articles_backup_20260422` (571건 보존)
- backfill로 약 298건 복구 (44%) — 성공률 1회차 90% → 이후 20% 수렴
- 복구 불가 373건 삭제 완료
- 현재 DB summary NULL: 2건 (사실상 0)

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

### 4. Cloudflare 이전 완료

- 가비아 → Cloudflare 네임서버 변경 완료
- 변경된 네임서버: `darl.ns.cloudflare.com`, `meiling.ns.cloudflare.com`
- 기존 가비아 네임서버 (롤백용): `ns.gabia.co.kr`, `ns1.gabia.co.kr`, `ns.gabia.net`
- DNS 레코드 전부 동일 (TXT 2, A 26, CNAME 6)
- 상태: Active
- Bot Fight Mode: ON
- 브라우저 무결성 검사: ON

### 5. Cloudflare WAF Rule 1 적용 완료

- 이름: Block SG bots
- 표현식: `(not cf.client.bot and ip.geoip.country eq "SG" and http.user_agent ne "")`
- 작업: Managed Challenge
- 상태: 배포 완료

### 6. Cache-Control 헤더 추가 (커밋 `6582472`)

- `/api/news-status`, `/api/trending-keywords`
- `Cache-Control: public, max-age=300, stale-while-revalidate=600`

---

## 진단 과정 (향후 참고)

1. `/api/news-status` 확인 → 파이프라인 정상, 환경변수 정상
2. GitHub Actions cron 확인 → 10회 전부 성공, `summarize=true` 포함
3. `/api/news-ingest?action=test` → Supabase OK, RapidAPI OK, Anthropic OK (status 200)
4. Supabase 직접 확인 → 4/15 이후 전부 excerpt NULL 확인
5. RapidAPI 직접 curl → **excerpt/thumbnail 필드 자체가 없음** ← 근�� 원인 확정
6. backfill이 "All articles already have summaries" 반환 → `.not("excerpt", "is", null)` 필터 때문

---

## 현재 상태

### 정상

- ingest 작동 중 (신규 기사 summary 정상 생성, 길이 150~200자)
- backfill 작동 중
- DB summary NULL 거의 0
- Cloudflare 활성 상태 + 봇 차단 1차 적용
- GitHub Actions Cron 정상 실행 (1~2시간 간격)

### 한계 (RapidAPI 스펙 변��� 후유증)

- **Summary 길이 짧음**: title만으로 생성해서 150~200자 (이전 excerpt 기반 300~500자)
- **이미지 없음**: RapidAPI가 thumbnail 필드 자체를 안 줌 → 모든 신규 기사 fallback 이미지

### 남은 Cloudflare 작업 (미완료)

- Rule 2: `(not cf.client.bot and http.request.uri.path contains "/topic")` → JS Challenge
- Rule 3: `(not cf.client.bot and http.request.uri.path contains "/api/")` → JS Challenge (Block 아님)

---

## 앞으로 할 일 (우선순위순)

### 1순위 — 3~5일 관찰 (아무것도 건드리지 말 것)

- ingest 정상 동작 여부
- summary 지속 생성되는지
- GSC 색인/노출 반응
- Functions 사용량 변화 (Netlify Pro 한도 대비)
- Cloudflare Rule 1 효과 (싱가포르 트래픽 감소 여부)

### 2순위 — Cloudflare Rule 2, 3 추가

언제든 가능. 1순위와 병행 가능. 하나씩 적용 → 10분 관찰 → 다음.

### 3순위 — og:image 추출 구현 (며칠 후)

- 기사 URL에서 `<meta property="og:image">` 태그 스크래핑
- 백그라운드 비동기 처리 (ingest blocking 절대 금지)
- fetch timeout 2~3초 제한
- 실패 시 fallback 이미지 유��

### 4순위 (장기) — RapidAPI 교체 검토

- excerpt/thumbnail 제대로 주는 다른 뉴스 API 조사
- 비용 대비 효과 판단
- Google 학습 안정화 후 진행

---

## 핵심 원칙 (이번 사건으로 얻은 교훈)

1. **외부 API 절대 신뢰 금지** — 필드 없을 때 fallback 항상 준비
2. **다운타임 후 데이터 품질 체크 먼저** — "기다리면 된다"로 가면 오염 데이터 누적
3. **코드 수정 금지 원칙은 상황에 따라 예외 적용** — 외부 API 스펙 변경 같은 구조 붕괴 시
4. **복구율 20% 이하로 떨어지면 복구 종료**
5. **순서 지키기**: ingest 수정 → 배포 → 검증 → DB 정리 (역순은 데이터 날아감)
6. **DELETE 전 반드시 백업 테이블 생성**
7. **대량 삭제는 소량 테스트 → 확인 → 전체 순서**

---

## 수정 금지 파일

- `src/lib/articles.ts` (절대 금지)
- `src/app/api/news-ingest/route.ts` (긴급 복구 완료 → 다시 수정 금지)
- `src/app/api/backfill-summaries/route.ts` (긴급 복구 완료 → 다시 수정 금지)
- Supabase schema (절대 금지)
- DB/API/URL/아키텍처 구조
- CORE_KEYWORDS 배열

---

## DB 참고 정보

### articles 테이블 컬럼 (13개)

id, title, slug, summary, excerpt, source_url, image_url, publisher, category, keywords, published_at, created_at, source_hash

### 주요 백업 테이블

- `articles_backup_20260416`
- `articles_backup_20260417`
- `articles_backup_20260422` (가장 최신, 571건)

### RapidAPI 엔드포인트

- `/v2/search/articles` (현재 사용)
- `/v2/trendings`
- Host: `news-api14.p.rapidapi.com`

---

## GSC 현황 (4/14 기준)

- 색인: 389페이지 (계속 증가 추세)
- 미색인: 199
- 클릭: 4 / 노출: 44
- 한국 CTR: 44%
- 노출 국가: 한국 9, 미국 18, 베트남 4, 보스니아 3, 인도 2, 기타 각 1
- 단계: 테스트 노출 단계 (정상)

---

## 보류 중인 작업

1. /category/:slug → /topic/:slug 301 리다이렉트
2. /topic/ai ilike %ai% 제거 (false positive)
3. /ai 페이지 필터 또는 타이틀 수정
4. iphone, 5g sitemap 대소문자 이슈
5. 공백 slug 83개
6. 이미지 — og:image 추출 또는 API 교체 (장기)

실행 트리거: impressions 증가 / 클릭 10+ / CTR 정체

---

## 참고 문서

| 문서 | 용도 |
|------|------|
| `CLAUDE.md` | 프로젝트 SSOT (운영 지시서 v1.2) |
| `GPT-HANDOFF-2026-04-06.md` | 이전 GPT 핸드오프 (콘텐츠 ���터) |
| `SESSION-HANDOFF-2026-04-22.md` | Claude 세션 핸드오프 |
