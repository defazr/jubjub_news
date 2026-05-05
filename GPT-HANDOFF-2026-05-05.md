# Headlines Fazr — GPT 핸드오프 (2026-05-05)

## 프로젝트 기본 정보

- 사이트: https://headlines.fazr.co.kr
- 호스팅: Netlify Pro (5/15 Free 전환 예정)
- DB: Supabase (PostgreSQL)
- DNS: Cloudflare Active (Bot Fight Mode OFF, WAF 규칙 5개)
- 도메인: 가비아 (NS만 Cloudflare)
- 아키텍처: RapidAPI → /api/news-ingest → Claude AI summary → Supabase → Next.js ISR

## 현재 상태: 운영 동결 (5/3~, 5/5 보완 완료)

사이트는 200 유지, 데이터/인프라 삭제하지 않음.
**5/5부로 모든 자동 수집 경로 차단 완료.**

---

## 이번 세션(5/5) 작업

### Netlify Scheduled Function 동결 누락 발견 및 수정

**문제:**
5/3 동결(커밋 `5ddce25`)에서 GitHub Actions cron 3개는 정상 비활성화했으나,
`netlify/functions/news-ingest.ts`의 Netlify Scheduled Function이 누락되어
4시간마다 `/api/news-ingest`가 자동 호출되고 있었음.

**증거:**
- 동결 후 296건 기사 추가 (4시간×6회/일×2일×평균25건 ≈ 300건)
- `articles_last_24h: 21` → 현재진행형 호출 확인

**원인 파일:**
```typescript
// netlify/functions/news-ingest.ts (line 50-52)
export const config = {
  schedule: "0 */4 * * *",  // ← 이게 살아있었음
};
```

**수정:**
config 블록 전체 주석 처리 (커밋 `7422e8e`)

```typescript
// export const config = {
//   schedule: "0 */4 * * *",
// };
```

**수정하지 않은 파일:** `src/app/api/news-ingest/route.ts` (수정 금지 원칙 준수)

---

## 동결 경로 전체 현황

| 자동 수집 경로 | 비활성화 시점 | 커밋 |
|--------------|-------------|------|
| GitHub Actions: news-ingest.yml | 5/3 | `5ddce25` |
| GitHub Actions: backfill-summaries.yml | 5/3 | `5ddce25` |
| GitHub Actions: og-image-extract.yml | 5/3 | `5ddce25` |
| **Netlify Scheduled Function: news-ingest.ts** | **5/5** | **`7422e8e`** |

---

## 동결 시점 시스템 상태

| 항목 | 상태 |
|------|------|
| 기사 수 | ~4,341 (동결 누락으로 296건 추가됨) |
| summary NULL | 0건 |
| Cron | GitHub Actions 3개 + Netlify Schedule 1개 전부 비활성 |
| Cloudflare | Active, WAF 5개 |
| Netlify | Pro (5/15 Free 전환 예정) |
| GSC | 색인 복구 작업 진행 중 |

---

## 검증 방법

1. 다음 UTC 4시간 경계(00/04/08/12/16/20 UTC) 이후 Netlify Functions 호출 없어야 함
2. `https://headlines.fazr.co.kr/api/news-status` → `articles_total` 증가 멈춤
   - `ingest_ok`가 `false`로 나올 수 있음 — 이는 최근 ingest가 없다는 뜻이므로 동결 상태에서는 **정상**
3. **5/5 21:00 KST** (12:00 UTC): 첫 번째 4시간 경계 — 호출 안 들어오면 비활성화 성공
4. **5/6 21:00 KST**: `articles_last_24h` → 0 확인 (진짜 동결 확정)

---

## 교훈 및 다음 세션 원칙

> Cron 비활성화 시 GitHub Actions만 보지 말 것. 반드시 다음을 모두 점검:
> 1. GitHub Actions workflows (`schedule:` 블록)
> 2. **Netlify Scheduled Functions** (`netlify/functions/*.ts`의 `export const config = { schedule }`)
> 3. Supabase pg_cron (해당 시)
> 4. 외부 cron 서비스 (cron-job.org 등)
>
> 검증 명령: `grep -r "schedule" netlify/functions/`

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
| 5/6 | articles_last_24h → 0 확인 (진짜 동결 검증) |
| 5/10 | 동결 효과 확인 (측정 시작점은 5/5 배포 이후, 약 5일분 데이터) |
| 5/14 | Free vs Pro 결정 (일 3K 이하 → Free) |
| 5/26 | 폭파 vs 유지 결정 (410 Gone 방식) |
| 6월 초 | GitHub repo archive 검토 |

---

## 커밋 이력 (이번 세션)

| 커밋 | 내용 |
|------|------|
| `7422e8e` | chore(cron): disable netlify scheduled function for news-ingest |

---

## 수정 금지 파일

- `src/lib/articles.ts` (절대)
- `src/app/api/news-ingest/route.ts` (절대)
- `src/app/api/backfill-summaries/route.ts` (절대)
- Supabase schema (절대)
- DB/API/URL/아키텍처 구조
- og:image 관련 모든 파일
- `netlify/functions/news-ingest.ts` — 이번 세션에서 schedule config만 주석 처리함. 함수 본체(fetch 래퍼)는 수정하지 않았으며, 향후에도 건드리지 말 것

---

## 참고 문서

| 문서 | 용도 |
|------|------|
| `CLAUDE.md` | 프로젝트 SSOT (운영 지시서 v1.2) |
| `GPT-HANDOFF-2026-05-03.md` | 이전 GPT 핸드오프 |
