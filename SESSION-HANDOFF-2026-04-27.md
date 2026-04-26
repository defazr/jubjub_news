# Headlines Fazr — 세션 핸드오프 (2026-04-27)

## 현재 상태

- 사이트: https://headlines.fazr.co.kr
- 브랜치: `main`
- 기사 수: 3,588+
- summary NULL: 2건 (사실상 0)
- image_url NULL: ~280건 → cron 자동 해소 중
- 파이프라인: 정상 (ingest + summary + og:image 자동)
- DNS: Cloudflare Active (Bot Fight Mode OFF, WAF 규칙 3개)
- 호스팅: Netlify Pro (5/15 Free 전환 예정)
- 단계: 6개월 관망 모드

---

## 이번 세션 커밋

| 커밋 | 내용 |
|------|------|
| `cd2fed1` | og:image 무한 반복 버그 수정 (not_found 시 빈 문자열 마킹) |

---

## 이번 세션 작업

- ✅ og:image 무한 반복 버그 수정 (`cd2fed1`)
  - 문제: not_found 시 image_url NULL 유지 → 같은 5건 무한 재시도
  - 해결: not_found → `""` 빈 문자열 마킹 → `.is("image_url", null)` 쿼리에서 제외
  - 프론트엔드: falsy 체크(`!url`)로 빈 문자열도 fallback 처리 → 영향 없음
- ✅ 대형 매체 og:image 추출 불가 확인 (NYT, WP 등)
  - 원인: 봇 차단 + 20KB head slice 초과
  - 결론: 정상 한계, fallback 이미지로 대체 (수정 불필요)
- ✅ 운영 룰 확정 (GPT 검토 반영)

---

## 확정된 운영 룰

### 절대 건드리지 말 것
- og:image limit = 5 (Free 전환 시 10초 timeout 안전선)
- Cloudflare WAF 규칙 3개 그대로 유지
- 코드 수정 X

### 5/14 Free 전환 기준 (보수적)
- 일 3K 이하 → Free 진행
- 일 3K~5K → 경계, Pro 유지 권장
- 일 5K 이상 → Pro 유지

### 메일 처리
- 무시: WPMU DEV 사이트 다운, GitHub Actions 옛날 502
- 확인: Netlify 한도 알림, 결제 실패, 사이트 다운, Supabase/Anthropic 알림

---

## 다음 세션 할 것

### 1. 4단계 DELETE (필수, 2회 연기됨)

```sql
SELECT COUNT(*) FROM articles_backup_20260422_phase0_delete;

DELETE FROM articles
WHERE id IN (SELECT id FROM articles_backup_20260422_phase0_delete);
```

### 2. og:image NULL 해소 확인 (1주일 후)

```sql
SELECT
  COUNT(*) FILTER (WHERE image_url IS NULL) AS still_null,
  COUNT(*) FILTER (WHERE image_url = '') AS marked_empty,
  COUNT(*) FILTER (WHERE image_url IS NOT NULL AND image_url != '') AS have_image
FROM articles;
```

기대값: still_null <50, marked_empty 200+, have_image 3,500+

### 3. 봇 차단 효과 확인 (5/3, 1주일 데이터)
- Cloudflare 대시보드: 차단 카운트
- Netlify 대시보드: Web Requests 일평균

### 4. Free vs Pro 결정 (5/14)

### 5. 폭파 vs 유지 결정 (5/26)

---

## 현재 한계 (받아들인 것)

- Summary 길이: 150~200자 (title 기반, excerpt 없어서 축소)
- og:image: 대형 매체 영구 fallback (봇 차단 + 20KB 초과)
- DB 오염: 228건 잔존 (contentFilter가 출력 차단 중, DELETE 미실행)

---

## 수정 금지 (항상)

- `src/lib/articles.ts`
- `src/app/api/news-ingest/route.ts`
- `src/app/api/backfill-summaries/route.ts`
- Supabase schema
- DB/API/URL/아키텍처 구조
- CORE_KEYWORDS 배열
- og:image limit = 5

---

## 체크포인트

| 날짜 | 할 것 |
|------|-------|
| 5/3 | 1주일 데이터 확인 (봇 차단 효과 + og:image NULL 감소) |
| 5/14 | Free vs Pro 결정 |
| 5/26 | 폭파 vs 유지 결정 |

---

## 참고 문서

| 문서 | 용도 |
|------|------|
| `CLAUDE.md` | 프로젝트 SSOT (운영 지시서 v1.2) |
| `GPT-HANDOFF-2026-04-26.md` | GPT 핸드오프 (이전 세션) |
| `SESSION-HANDOFF-2026-04-26.md` | 이전 세션 핸드오프 |
