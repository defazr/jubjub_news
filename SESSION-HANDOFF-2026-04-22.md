# Headlines Fazr — 세션 핸드오프 (2026-04-22 최종)

## 현재 상태

- 사이트: https://headlines.fazr.co.kr
- 브랜치: `main`
- 기사 수: 3,588
- summary NULL: 2건
- 파이프라인: 정상 (ingest + summary + og:image 자동)
- DNS: Cloudflare Active (Bot Fight Mode OFF)
- 호스팅: Netlify Free
- 단계: Phase 0 완료 → 6개월 관망 모드

---

## 이번 세션 커밋 (10개)

| 커밋 | 내용 |
|------|------|
| `6582472` | Cache-Control 헤더 |
| `ed14fee` | ingest 복구 (RapidAPI 스펙 대응) |
| `ba81a15` | backfill 복구 |
| `96083aa` | Cron UA (실패) |
| `fbad8fe` | Cron UA Chrome 위장 (성공) |
| `de972e9` | 프롬프트 + fallback + NULL 금지 |
| `76567d5` | 3중 가드 + 마크다운 후처리 |
| `0e19fd7` | 카테고리 사전 차단 |
| `162fb0d` | og:image 독립 추출 시스템 |
| 핸드오프 | 문서 2회 업데이트 |

---

## Phase 0 완료 상태

- ✅ 1단계: Cron 200 (Bot Fight Mode OFF + UA 위장)
- ✅ 2단계: 3중 가드 + 프롬프트 (메타코멘트 차단, 영어 유지)
- ✅ 3단계: DB 오염 파악 (228건)
- ⏸ 4단계: DELETE (다음 세션)
- ✅ 5단계: 카테고리 사전 차단
- ✅ og:image 독립 추출 (60% 성공률, 에러 0)

---

## 신규 파일 (이번 세션)

| 파일 | 역할 |
|------|------|
| `src/lib/ogImageExtractor.ts` | og:image 추출 유틸 |
| `src/app/api/extract-og-images/route.ts` | og:image API |
| `.github/workflows/og-image-extract.yml` | og:image cron (매시간 :30) |

---

## 다음 세션 할 것

### 1. 4단계 DELETE

```sql
SELECT COUNT(*) FROM articles_backup_20260422_phase0_delete;

DELETE FROM articles
WHERE id IN (SELECT id FROM articles_backup_20260422_phase0_delete);
```

### 2. og:image 결과 확인

```sql
SELECT
  COUNT(*) FILTER (WHERE image_url IS NULL) AS still_null,
  COUNT(*) FILTER (WHERE image_url IS NOT NULL) AS have_image
FROM articles;
```

### 3. 관망 모드 진입

---

## 현재 한계

- **Summary 길이**: 150~200자 (title 기반, 이전 300~500자)
- **이미지**: og:image 추출 60% 성공, 나머지 fallback
- **DB 오염**: 228건 잔존 (contentFilter가 출력 차단 중)

---

## 수정 금지 (항상)

- `src/lib/articles.ts`
- `src/app/api/news-ingest/route.ts`
- `src/app/api/backfill-summaries/route.ts`
- Supabase schema
- DB/API/URL/아키텍처 구조
- CORE_KEYWORDS 배열

---

## 핵심 원칙

1. 외부 API 절대 신뢰 금지
2. ingest는 외부 의존하지 않는 구조
3. summary 영어 유지
4. DELETE 전 백업 필수
5. Bot Fight Mode OFF 유지 (cron 호환)

---

## 참고 문서

| 문서 | 용도 |
|------|------|
| `CLAUDE.md` | 프로젝트 SSOT |
| `GPT-HANDOFF-2026-04-22.md` | GPT 핸드오프 (최종) |
| `SESSION-HANDOFF-2026-04-06.md` | 이전 세션 핸드오프 |
