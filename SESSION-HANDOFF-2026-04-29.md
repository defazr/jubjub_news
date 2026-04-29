# Headlines Fazr — 세션 핸드오프 (2026-04-29)

## 현재 상태

- 사이트: https://headlines.fazr.co.kr
- 브랜치: `main`
- 기사 수: 4,045+
- summary NULL: **0건**
- image_url NULL: cron 자동 해소 중 (대형 매체 영구 fallback)
- 파이프라인: 정상 (ingest + summary + og:image 자동)
- DNS: Cloudflare Active (Bot Fight Mode OFF, WAF 규칙 5개)
- 호스팅: Netlify Pro (5/15 Free 전환 예정)
- 단계: 6개월 관망 모드

---

## 이번 세션 커밋

| 커밋 | 내용 |
|------|------|
| `f901d12` | cron: summary backfill을 ingest에서 분리 (502 timeout 해결) |

---

## 이번 세션 작업

- ✅ **News Ingest 502 timeout 해결** (`f901d12`)
  - 문제: `summarize=true`로 AI 30~50건 병렬 호출 → 26초 초과 → 502
  - 해결: ingest에서 summarize 분리 → `backfill-summaries.yml` 별도 workflow
  - 추가: `--max-time 30`, 문자열 비교 `!= "200"` (curl 000 안전)
  - 검증: ingest 5초, backfill 3초 (기존 12~46초 → 8~9배 개선)
  - Free 10초 안전선 확보
- ✅ Cloudflare WAF 규칙 host 제한 추가 (규칙 4, 5)
- ✅ 색인 복구 작업 (사이트맵 재제출)

---

## Cron 현황 (3개 분리)

| workflow | 파일 | cron | limit | 실행 시간 |
|----------|------|------|-------|----------|
| News Ingest | `news-ingest.yml` | `0 */2 * * *` | — | ~5초 |
| Backfill Summaries | `backfill-summaries.yml` | `10,40 * * * *` | 5 | ~3초 |
| OG Image Extract | `og-image-extract.yml` | `15,45 * * * *` | 5 | — |

---

## 다음 세션 할 것

### 1. 24시간 안정성 확인 (4/30, 5분)
- GitHub Actions: 모든 run 200 확인
- 502 메일 없는지 확인

### 2. 4단계 DELETE (필수, 3회 연기됨)

```sql
SELECT COUNT(*) FROM articles_backup_20260422_phase0_delete;

DELETE FROM articles
WHERE id IN (SELECT id FROM articles_backup_20260422_phase0_delete);
```

### 3. og:image NULL 해소 확인 (5/3)

```sql
SELECT
  COUNT(*) FILTER (WHERE image_url IS NULL) AS still_null,
  COUNT(*) FILTER (WHERE image_url = '') AS marked_empty,
  COUNT(*) FILTER (WHERE image_url IS NOT NULL AND image_url != '') AS have_image
FROM articles;
```

### 4. 봇 차단 효과 + GSC 색인 복구 (5/3)
### 5. Free vs Pro 결정 (5/14)
### 6. 폭파 vs 유지 결정 (5/26)

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
- backfill-summaries limit = 5

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
| `GPT-HANDOFF-2026-04-29.md` | GPT 핸드오프 |
| `GPT-HANDOFF-2026-04-27.md` | 이전 GPT 핸드오프 |
