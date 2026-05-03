# Headlines Fazr — GPT 핸드오프 (2026-05-03)

## 프로젝트 기본 정보

- 사이트: https://headlines.fazr.co.kr
- 호스팅: Netlify Pro (5/15 Free 전환 예정)
- DB: Supabase (PostgreSQL)
- DNS: Cloudflare Active (Bot Fight Mode OFF, WAF 규칙 5개)
- 도메인: 가비아 (NS만 Cloudflare)
- 아키텍처: RapidAPI → /api/news-ingest → Claude AI summary → Supabase → Next.js ISR

## 현재 상태: 운영 동결 (5/3~)

신규 수집/요약/이미지 백필 전부 중단.
사이트는 200 유지, 데이터와 인프라는 삭제하지 않음.

---

## 이번 세션(5/3) 작업

### 1. GitHub Actions cron 비활성화 ✅

**목표:** Headlines Fazr 자동 파이프라인 중단 (동결)

**작업 내용:**
- `news-ingest.yml` — schedule 주석 처리, workflow_dispatch 유지
- `backfill-summaries.yml` — schedule 주석 처리, workflow_dispatch 유지
- `og-image-extract.yml` — schedule 주석 처리, workflow_dispatch 유지

**커밋:** `5ddce25`

**되살리기:** 주석 3줄 풀면 30초면 복구 가능

### 2. RapidAPI 자동갱신 해지 (본인 직접)

- RapidAPI 대시보드에서 구독 해지/자동갱신 비활성화

---

## 동결 시점 시스템 상태

| 항목 | 상태 |
|------|------|
| 기사 수 | 4,045+ |
| summary NULL | 0건 |
| Cron | 3개 전부 비활성 (수동 실행만 가능) |
| Cloudflare | Active, WAF 5개 |
| Netlify | Pro (5/15 Free 전환 예정) |
| GSC | 색인 복구 작업 진행 중 |

---

## 건드리지 말 것

| 항목 | 이유 |
|------|------|
| Supabase | 1~2주 보존 (롤백 가능성) |
| Netlify 사이트 | 200 유지 (도메인 평판) |
| Cloudflare WAF | support.fazr.co.kr 보호 |
| DNS 레코드 | 사이트 살아있어야 함 |
| GSC 설정 | 진행 중 검사 자동 정리됨 |
| GitHub repo | archive는 6월 초 |

---

## 미실행 잔여 작업 (동결로 보류)

- 4단계 DELETE (DB 오염 228건, 3회 연기됨)
- og:image NULL 해소 확인
- 봇 차단 효과 + GSC 색인 복구 확인

---

## 체크포인트

| 날짜 | 할 것 |
|------|-------|
| 5/10 | 동결 효과 확인 (Cloudflare 트래픽, Supabase Egress, Netlify 요청량 감소) |
| 5/14 | Free vs Pro 결정 (일 3K 이하 → Free) |
| 5/26 | 폭파 vs 유지 결정 (410 Gone 방식) |
| 6월 초 | GitHub repo archive 검토 |

---

## 5/10 동결 효과 확인 체크리스트

1. support.fazr.co.kr 정상?
   - GSC 색인 회복 중인지
   - AdSense 수익 정상인지
   - 사이트 정상 작동인지

2. headlines 효과
   - Cloudflare 트래픽 감소 확인
   - Supabase Egress 감소 확인
   - Netlify 요청량 감소 확인
   - 새 기사 안 들어옴 (정상)

3. 다른 사이트 영향
   - 26개 사이트 중 이상 보고 없음
   - AdSense 전체 수익 추세 정상

4. 다음 단계 결정
   - 모두 정상 → 410 Gone 방식 폭파 진행
   - 이상 발견 → 원인 파악 후 다시 결정

---

## 커밋 이력 (이번 세션)

| 커밋 | 내용 |
|------|------|
| `5ddce25` | chore(cron): pause headlines automated ingestion workflows |

---

## 수정 금지 파일

- `src/lib/articles.ts` (절대)
- `src/app/api/news-ingest/route.ts` (절대)
- `src/app/api/backfill-summaries/route.ts` (절대)
- Supabase schema (절대)
- DB/API/URL/아키텍처 구조
- og:image 관련 모든 파일

---

## 참고 문서

| 문서 | 용도 |
|------|------|
| `CLAUDE.md` | 프로젝트 SSOT (운영 지시서 v1.2) |
| `GPT-HANDOFF-2026-04-29.md` | 이전 GPT 핸드오프 |
