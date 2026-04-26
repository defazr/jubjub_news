# Headlines Fazr — 세션 핸드오프 (2026-04-26)

## 현재 상태

- 사이트: https://headlines.fazr.co.kr
- 브랜치: `main`
- 기사 수: 3,588+
- summary NULL: 2건
- image_url NULL: ~270건 → cron 자동 감소 중
- 파이프라인: 정상 (ingest + summary + og:image 자동)
- DNS: Cloudflare Active (Bot Fight Mode OFF, WAF 규칙 3개)
- 호스팅: Netlify Pro (5/15 Free 전환 예정)
- 단계: 6개월 관망 모드

---

## 이번 세션 커밋

| 커밋 | 내용 |
|------|------|
| `ee97392` | og:image limit 30→5, cron :30→:15/:45 |

---

## 이번 세션 작업

- ✅ og:image cron 502 timeout 수정 (limit 30→5, 시간당 2회)
- ✅ Cloudflare 봇 차단 규칙 2개 추가 (국가 + ASN)
- ⏸ 4단계 DELETE (다음 세션)
- ⏸ 로또 프로젝트 진단 (다음)

---

## 다음 세션 할 것

### 1. 4단계 DELETE

```sql
SELECT COUNT(*) FROM articles_backup_20260422_phase0_delete;

DELETE FROM articles
WHERE id IN (SELECT id FROM articles_backup_20260422_phase0_delete);
```

### 2. og:image NULL 확인

```sql
SELECT
  COUNT(*) FILTER (WHERE image_url IS NULL) AS still_null,
  COUNT(*) FILTER (WHERE image_url IS NOT NULL) AS have_image
FROM articles;
```

### 3. 봇 차단 효과 1주일 모니터링 → 5/15 Free 전환 결정

---

## 현재 한계

- **Summary 길이**: 150~200자 (title 기반, 이전 300~500자)
- **이미지**: og:image 추출 60% 성공, 나머지 fallback
- **DB 오염**: 228건 잔존 (contentFilter가 출력 차단 중)
- **og:image NULL**: 270건 (1~2일 내 자동 해소 예상)

---

## Cloudflare WAF 규칙

| 순서 | 이름 | 작업 |
|------|------|------|
| 1 | Allow cron API requests | Allow |
| 2 | Block bot regions (SG/HK/ID/VN) | Managed Challenge |
| 3 | Block datacenter ASNs (9개, Azure 제외) | Managed Challenge |

---

## 수정 금지 (항상)

- `src/lib/articles.ts`
- `src/app/api/news-ingest/route.ts`
- `src/app/api/backfill-summaries/route.ts`
- Supabase schema
- DB/API/URL/아키텍처 구조
- CORE_KEYWORDS 배열

---

## 참고 문서

| 문서 | 용도 |
|------|------|
| `CLAUDE.md` | 프로젝트 SSOT |
| `GPT-HANDOFF-2026-04-26.md` | GPT 핸드오프 |
| `SESSION-HANDOFF-2026-04-22.md` | 이전 세션 핸드오프 |
