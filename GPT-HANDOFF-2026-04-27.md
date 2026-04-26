# Headlines Fazr — GPT 핸드오프 (2026-04-27)

## 프로젝트 기본 정보

- 사이트: https://headlines.fazr.co.kr
- 호스팅: Netlify Pro (5/15 Free 전환 예정)
- DB: Supabase (PostgreSQL)
- DNS: Cloudflare Active (Bot Fight Mode OFF, WAF 규칙 3개)
- 도메인: 가비아 (NS만 Cloudflare)
- 아키텍처: RapidAPI → /api/news-ingest → Claude AI summary → Supabase → Next.js ISR
- Cron: ingest 매 2시간 정각 + og:image 매시간 :15, :45 (limit=5)

## 역할 분담

- GPT: 계획 및 지시서 초안, 전략 판단
- Claude (채팅): 검증, 판단, 지시서 보완
- Claude Code: 실제 코드 작업, 배포
- 본인: 최종 결정, Supabase SQL, Cloudflare 대시보드, Netlify 모니터링

---

## 이번 세션(4/27) 작업

### 1. og:image 무한 반복 버그 수정 ✅

**문제:** not_found 처리 후 image_url NULL 유지 → 같은 5건 무한 재시도 → 새 NULL 기사 영원히 미처리
**증거:** 4시간 전 NULL 270건 → 현재 280건 (+10, 새 기사 유입만 반영)

**해결:**
```typescript
// not_found → 빈 문자열로 마킹하여 재시도 방지
await supabase.from("articles").update({ image_url: "" }).eq("id", article.id);
```

- `.is("image_url", null)` 쿼리에서 제외됨
- 프론트엔드: falsy 체크(`!url`)로 빈 문자열도 fallback → 영향 없음
- 커밋: `cd2fed1`

### 2. 대형 매체 og:image 추출 불가 확인 ✅

**진단 결과:**
- 정규식/코드 버그 아님
- 대형 매체(NYT, WP, CNN 등)가 봇 차단 또는 head 20KB 이후에 og:image 배치
- 추출 불가 = 정상 한계 → fallback 이미지 사용

### 3. 운영 룰 확정 (GPT 검토 반영) ✅

---

## 커밋 이력 (이번 세션)

| 커밋 | 내용 |
|------|------|
| `cd2fed1` | og:image not_found 시 빈 문자열 마킹 → 무한 반복 방지 |

---

## 현재 시스템 상태

| 항목 | 상태 |
|---|---|
| 기사 수 | 3,588+ |
| summary NULL | 2건 (사실상 0) |
| image_url NULL | ~280건 → cron 자동 감소 중 |
| 파이프라인 | 정상 (ingest + summary + og:image) |
| Cron ingest | 매 2시간 정각, Response 200 |
| Cron og:image | 매시간 :15, :45, limit=5 |
| Cloudflare | Active, Bot Fight Mode OFF, WAF 규칙 3개 |
| Netlify | Pro (5/15 Free 전환 예정) |
| GSC | 색인 389p, 클릭 4, 노출 44 |

---

## 확정된 운영 룰 (4/27)

### 절대 건드리지 말 것
- og:image limit = 5 (Free 10초 timeout 안전선)
- Cloudflare WAF 규칙 3개 그대로
- 코드 수정 X

### 5/14 Free 전환 기준 (보수적, GPT 수정)
- 일 3K 이하 → Free 진행
- 일 3K~5K → 경계, Pro 유지 권장
- 일 5K 이상 → Pro 유지

### 메일 처리
- 무시: WPMU DEV 사이트 다운, GitHub Actions 옛날 502
- 확인: Netlify 한도/다운 알림, 결제 실패, Supabase/Anthropic 알림

### Google 봇 안전
- Block bot regions: `not cf.client.bot` 조건 → Googlebot 통과 확인
- Block datacenter ASNs: ASN 15169(Google Cloud) 포함, Googlebot은 다른 IP → 영향 없음

---

## 다음 세션에서 할 것

### 1. 4단계 DELETE (필수, 2회 연기됨)

```sql
SELECT COUNT(*) FROM articles_backup_20260422_phase0_delete;

DELETE FROM articles
WHERE id IN (SELECT id FROM articles_backup_20260422_phase0_delete);
```

### 2. og:image NULL 해소 확인

```sql
SELECT
  COUNT(*) FILTER (WHERE image_url IS NULL) AS still_null,
  COUNT(*) FILTER (WHERE image_url = '') AS marked_empty,
  COUNT(*) FILTER (WHERE image_url IS NOT NULL AND image_url != '') AS have_image
FROM articles;
```

기대값: still_null <50, marked_empty 200+, have_image 3,500+

### 3. 봇 차단 효과 확인 (5/3)
### 4. Free vs Pro 결정 (5/14)
### 5. 폭파 vs 유지 결정 (5/26)

---

## 수정 금지 파일

- `src/lib/articles.ts` (절대)
- `src/app/api/news-ingest/route.ts` (절대)
- `src/app/api/backfill-summaries/route.ts` (절대)
- Supabase schema (절대)
- DB/API/URL/아키텍처 구조
- CORE_KEYWORDS 배열

---

## Cloudflare WAF 규칙 현황

| 순서 | 이름 | 표현식 | 작업 |
|------|------|--------|------|
| 1 | Allow cron API requests | (우선 실행) | Allow |
| 2 | Block bot regions | country in SG/HK/ID/VN, not cf.client.bot | Managed Challenge |
| 3 | Block datacenter ASNs | ASN 9개 (8075 Azure 제외) | Managed Challenge |

---

## 체크포인트

| 날짜 | 할 것 |
|------|-------|
| 5/3 | 1주일 데이터 확인 (봇 차단 + og:image NULL) |
| 5/14 | Free vs Pro 결정 |
| 5/26 | 폭파 vs 유지 결정 |

---

## 참고 문서

| 문서 | 용도 |
|------|------|
| `CLAUDE.md` | 프로젝트 SSOT (운영 지시서 v1.2) |
| `SESSION-HANDOFF-2026-04-27.md` | Claude 세션 핸드오프 |
| `GPT-HANDOFF-2026-04-26.md` | 이전 GPT 핸드오프 |
