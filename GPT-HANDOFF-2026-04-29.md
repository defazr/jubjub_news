# Headlines Fazr — GPT 핸드오프 (2026-04-29)

## 프로젝트 기본 정보

- 사이트: https://headlines.fazr.co.kr
- 호스팅: Netlify Pro (5/15 Free 전환 예정)
- DB: Supabase (PostgreSQL)
- DNS: Cloudflare Active (Bot Fight Mode OFF, WAF 규칙 5개)
- 도메인: 가비아 (NS만 Cloudflare)
- 아키텍처: RapidAPI → /api/news-ingest → Claude AI summary → Supabase → Next.js ISR
- Cron 3개 분리:
  - ingest: 매 2시간 정각 (~5초)
  - backfill-summaries: 매시간 :10, :40, limit=5 (~3초)
  - og:image: 매시간 :15, :45, limit=5

## 역할 분담

- GPT: 계획 및 지시서 초안, 전략 판단, 태클/보강 검증
- Claude (UI): 검증, 판단, 지시서 보완, 최종 회신 작성
- Claude Code: 실제 코드 작업, 배포
- 본인: 최종 결정, Supabase SQL, Cloudflare 대시보드, GitHub Actions UI

---

## 이번 세션(4/29) 작업

### 1. News Ingest 502 timeout 해결 ✅

**문제:** `summarize=true`로 AI 30~50건 병렬 호출 → Netlify Pro 26초 초과 → 41~46초 502 반복
**근거:** AUDIT-2026-04-29.md (코드 분석) + GitHub Actions 실제 로그 (#500, 42초 실패)

**해결:**
- `news-ingest.yml`에서 `&summarize=true` 제거 + backfill step 제거
- `backfill-summaries.yml` 별도 workflow 신규 생성
- `--max-time 120` → `30`으로 축소
- curl 실패 판정을 문자열 비교(`!= "200"`)로 통일 (000 timeout 안전)
- 커밋: `f901d12`

**검증 결과:**
| workflow | HTTP | 실행 시간 | Free 10s 안전 |
|----------|------|----------|--------------|
| News Ingest | 200 | 5초 | ✅ |
| Backfill Summaries | 200 | 3초 | ✅ |

**기존 대비:** 12~46초 → 5초 + 3초 (8~9배 개선)

### 2. Cloudflare WAF 규칙 host 제한 추가 ✅

- 규칙 4, 5에 host 제한 추가 (다른 세션에서 작업)
- support.fazr.co.kr 색인 복구 진행
- headlines.fazr.co.kr 사이트맵 재제출

---

## 커밋 이력 (이번 세션)

| 커밋 | 내용 |
|------|------|
| `f901d12` | cron: summary backfill을 ingest에서 분리 (502 timeout 해결) |

---

## 현재 시스템 상태

| 항목 | 상태 |
|---|---|
| 기사 수 | 4,045+ |
| summary NULL | **0건** |
| image_url NULL | cron 자동 해소 중 (대형 매체 영구 fallback) |
| 파이프라인 | 정상 (ingest + summary + og:image) |
| Cron ingest | 매 2시간 정각, ~5초, 200 |
| Cron backfill | 매시간 :10/:40, limit=5, ~3초, 200 |
| Cron og:image | 매시간 :15/:45, limit=5 |
| Cloudflare | Active, Bot Fight Mode OFF, WAF 규칙 5개 |
| Netlify | Pro (5/15 Free 전환 예정) |
| GSC | 색인 복구 작업 진행 중 |

---

## Supabase 베이스라인 (4/29 수동 trigger 전)

```
summary_null: 0
summary_have: 4,045
last_ingest: 2026-04-29T08:05:48+00
```

---

## 확정된 운영 룰 (4/27 확정 + 4/29 추가)

### 절대 건드리지 말 것
- og:image limit = 5 (Free 10초 timeout 안전선)
- backfill-summaries limit = 5 (보수적 시작값, 1주일 후 상향 검토 가능)
- Cloudflare WAF 규칙 5개 그대로
- 코드 수정 X

### 5/14 Free 전환 기준 (보수적)
- 일 3K 이하 → Free 진행
- 일 3K~5K → 경계, Pro 유지 권장
- 일 5K 이상 → Pro 유지

### 메일 처리
- 무시: WPMU DEV 사이트 다운, GitHub Actions 옛날 502
- 확인: Netlify 한도/다운 알림, 결제 실패, Supabase/Anthropic 알림

---

## Cron 충돌 회피 맵

| 분 | workflow |
|----|----------|
| :00 | ingest (2시간마다) |
| :10 | backfill-summaries |
| :15 | og:image |
| :40 | backfill-summaries |
| :45 | og:image |

→ 겹치는 시간대 없음

---

## 다음 세션에서 할 것

### 1. 4단계 DELETE (필수, 3회 연기됨)

```sql
SELECT COUNT(*) FROM articles_backup_20260422_phase0_delete;

DELETE FROM articles
WHERE id IN (SELECT id FROM articles_backup_20260422_phase0_delete);
```

### 2. 24시간 안정성 확인 (4/30)
- GitHub Actions: News Ingest 12회 + Backfill 48회 모두 200?
- 502 메일 없는지?
- Supabase: summary_null 유지 0?

### 3. og:image NULL 해소 확인 (5/3)

```sql
SELECT
  COUNT(*) FILTER (WHERE image_url IS NULL) AS still_null,
  COUNT(*) FILTER (WHERE image_url = '') AS marked_empty,
  COUNT(*) FILTER (WHERE image_url IS NOT NULL AND image_url != '') AS have_image
FROM articles;
```

### 4. 봇 차단 효과 + GSC 색인 복구 확인 (5/3)
### 5. Free vs Pro 결정 (5/14)
### 6. 폭파 vs 유지 결정 (5/26)

---

## 수정 금지 파일

- `src/lib/articles.ts` (절대)
- `src/app/api/news-ingest/route.ts` (절대)
- `src/app/api/backfill-summaries/route.ts` (절대)
- Supabase schema (절대)
- DB/API/URL/아키텍처 구조
- CORE_KEYWORDS 배열
- og:image 관련 모든 파일

---

## Cloudflare WAF 규칙 현황 (4/29)

| 순서 | 이름 | 작업 |
|------|------|------|
| 1 | Allow cron API requests | Allow |
| 2 | Block bot regions (SG/HK/ID/VN) | Managed Challenge |
| 3 | Block datacenter ASNs (9개) | Managed Challenge |
| 4 | (host 제한 추가) | Managed Challenge |
| 5 | (host 제한 추가) | Managed Challenge |

---

## 체크포인트

| 날짜 | 할 것 |
|------|-------|
| 4/30 | 24시간 안정성 확인 (5분) |
| 5/3 | 1주일 데이터 (봇 차단 + og:image + GSC 색인 복구) |
| 5/14 | Free vs Pro 결정 |
| 5/26 | 폭파 vs 유지 결정 |

---

## 참고 문서

| 문서 | 용도 |
|------|------|
| `CLAUDE.md` | 프로젝트 SSOT (운영 지시서 v1.2) |
| `AUDIT-2026-04-29.md` | GitHub Actions 안정화 오디트 (브랜치 `claude/audit-github-actions-blqCn`) |
| `SESSION-HANDOFF-2026-04-29.md` | Claude 세션 핸드오프 |
| `GPT-HANDOFF-2026-04-27.md` | 이전 GPT 핸드오프 |
