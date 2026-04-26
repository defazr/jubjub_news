# Headlines Fazr — GPT 핸드오프 (2026-04-26)

## 프로젝트 기본 정보

- 사이트: https://headlines.fazr.co.kr
- 호스팅: Netlify Pro (5/15 Free 전환 예정, 1주일 모니터링 후 결정)
- DB: Supabase (PostgreSQL)
- DNS: Cloudflare Active (Bot Fight Mode OFF, WAF 규칙 3개)
- 도메인: 가비아 (NS만 Cloudflare)
- 아키텍처: RapidAPI → /api/news-ingest → Claude AI summary → Supabase → Next.js ISR
- Cron: ingest 매 2시간 정각 + og:image 매시간 :15, :45 (limit=5)

## 역할 분담

- GPT: 계획 및 지시서 초안
- Claude (채팅): 검증, 판단, 지시서 보완
- Claude Code: 실제 코드 작업, 배포
- 본인: 최종 결정, Supabase SQL, Cloudflare 대시보드, Netlify 모니터링

---

## 이번 세션(4/26) 작업

### 1. og:image cron 502 timeout 수정 ✅

**문제:** 4/22~4/26 4일간 og:image cron 502 실패
**원인:** limit=30 처리 시 60~90초 소요, Netlify Pro 26초 timeout 초과
**결과:** DB image_url NULL 270건 누적

**해결:**
| 항목 | 이전 | 이후 |
|------|------|------|
| limit | 30 | 5 |
| cron | 매시간 :30 (1회) | 매시간 :15, :45 (2회) |
| 처리량 | 시간당 30건 (실제 0 - 502) | 시간당 10건 (안정) |
| 하루 처리량 | 0건 (fail) | ~240건 |

- 5건 × ~3초 = ~15초 (Netlify 26초 내 안전)
- NULL 270건 → 1~2일 내 해소 예상 (추출 불가 30~50건 잔존)
- 커밋: `ee97392`

### 2. Cloudflare 봇 차단 규칙 추가 ✅

**Rule 1: Block bot regions** (Managed Challenge)
```
(not cf.client.bot and ip.geoip.country in {"SG" "HK" "ID" "VN"} and http.user_agent ne "")
```

**Rule 2: Block datacenter ASNs** (Managed Challenge)
```
(ip.geoip.asnum in {16509 14618 15169 13335 16276 396982 14061 19551 32934})
```

| ASN | 서비스 |
|-----|--------|
| 16509, 14618 | AWS |
| 15169 | Google Cloud |
| 13335 | Cloudflare Workers |
| 16276 | OVH |
| 396982 | Google (기타) |
| 14061 | DigitalOcean |
| 19551 | Incapsula |
| 32934 | Facebook |

**주의:** ASN 8075 (Microsoft Azure) 제외 — GitHub Actions가 Azure에서 실행됨

두 규칙 모두 "Allow cron API requests" 다음에 실행되도록 배치.

---

## 커밋 이력 (이번 세션)

| 커밋 | 내용 |
|------|------|
| `ee97392` | og:image limit 30→5, cron :30→:15/:45 |

---

## 현재 시스템 상태

| 항목 | 상태 |
|---|---|
| 기사 수 | 3,588+ |
| summary NULL | 2건 (사실상 0) |
| image_url NULL | ~270건 → cron 자동 감소 중 |
| 파이프라인 | 정상 (ingest + summary + og:image) |
| Cron ingest | 매 2시간 정각, Response 200 |
| Cron og:image | 매시간 :15, :45, limit=5 |
| Cloudflare | Active, Bot Fight Mode OFF, WAF 규칙 3개 |
| Netlify | Pro (5/15 Free 전환 예정) |
| GSC | 색인 389p, 클릭 4, 노출 44 |

---

## 다음 세션에서 할 것

### 1. 4단계 DELETE (필수, 이전 세션에서 연기)

```sql
SELECT COUNT(*) FROM articles_backup_20260422_phase0_delete;

DELETE FROM articles
WHERE id IN (SELECT id FROM articles_backup_20260422_phase0_delete);
```

### 2. og:image NULL 해소 확인

```sql
SELECT
  COUNT(*) FILTER (WHERE image_url IS NULL) AS still_null,
  COUNT(*) FILTER (WHERE image_url IS NOT NULL) AS have_image
FROM articles;
```

예상: still_null 30~50건 (추출 불가 사이트만 남음)

### 3. Cloudflare 봇 차단 효과 확인

- 1주일간 봇 트래픽 감소 모니터링
- 효과 충분하면 5/15 Netlify Free 전환 진행

### 4. 로또 프로젝트 진단 (보류)

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
| 1 | Allow cron API requests | (미확인, 우선 실행) | Allow |
| 2 | Block bot regions | country in SG/HK/ID/VN | Managed Challenge |
| 3 | Block datacenter ASNs | ASN 9개 (8075 Azure 제외) | Managed Challenge |

---

## 참고 문서

| 문서 | 용도 |
|------|------|
| `CLAUDE.md` | 프로젝트 SSOT (운영 지시서 v1.2) |
| `SESSION-HANDOFF-2026-04-26.md` | Claude 세션 핸드오프 |
| `GPT-HANDOFF-2026-04-22.md` | 이전 핸드오프 (Phase 0) |
