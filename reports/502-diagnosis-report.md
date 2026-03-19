# 502 에러 진단 및 해결 보고서

**날짜**: 2026-03-19
**사이트**: https://headlines.fazr.co.kr
**상태**: 해결 완료 (배포 대기)

---

## 1. 문제 현상

- `/api/news-ingest` 호출 시 **502 Bad Gateway** 발생
- GitHub Actions Cron이 매시간 실행되나 ingest 실패

---

## 2. GPT 초기 진단 (틀림)

GPT는 처음에 다음과 같이 판단:

> "Supabase 프로젝트가 2024-06-24 이후 paused 상태이며 복구 불가.
> DB 연결 자체가 실패하여 articles_total = 0, last_ingest = null"

### 왜 틀렸나

- `/api/news-status` 실제 응답: `articles_total: 1062`, `articles_last_24h: 61`
- `/api/news-ingest?action=test` 결과:
  - Supabase: `ok: true, rows: 1`
  - RapidAPI: `status: 200`
  - Anthropic: `status: 200`
- **DB는 정상 작동 중이었음**

---

## 3. GPT 수정 진단 (맞음)

이후 GPT가 수정한 진단:

> "모든 외부 서비스 정상. 502의 원인은 Netlify 함수 timeout (10초 제한)"

### 코드 분석으로 확인된 사실

**기존 코드 (순차 실행):**

```typescript
// 카테고리 8개를 하나씩 순서대로 호출
for (const cat of CATEGORIES) {
  const articles = await fetchByCategory(cat.query, "en");
  await new Promise((r) => setTimeout(r, 300)); // 300ms 대기
}
```

**실행 시간 계산:**
- 트렌딩 API: ~1-2초
- 카테고리 8개 순차: 8 × (~1초 + 300ms) = ~10초
- AI 요약 (summarize=true): 배치당 수 초 추가
- DB 저장: ~1초
- **총합: 12-15초 이상**

**Netlify 무료 플랜 제한: 10초**

`export const maxDuration = 60`은 Next.js 설정이며, Netlify에서는 무시됨.

---

## 4. 최종 결론

| 항목 | 결과 |
|------|------|
| DB (Supabase) | 정상 |
| 뉴스 API (RapidAPI) | 정상 |
| AI 요약 (Anthropic) | 정상 |
| **502 원인** | **Netlify 함수 timeout (10초 초과)** |
| 원인 코드 | 카테고리 8개 순차 호출 + 300ms 딜레이 |

---

## 5. 적용된 해결책

### 5-1. 카테고리 병렬 fetch

**Before (순차 ~10초):**
```typescript
for (const cat of CATEGORIES) {
  const articles = await fetchByCategory(cat.query, "en");
  await new Promise((r) => setTimeout(r, 300));
}
```

**After (병렬 ~1-2초):**
```typescript
const [trending, ...categoryResults] = await Promise.all([
  fetchTrending("en"),
  ...CATEGORIES.map((cat) => fetchByCategory(cat.query, "en")),
]);
```

### 5-2. AI 요약 병렬화

**Before:** 10개씩 순차 배치 처리
**After:** 전체 동시 `Promise.allSettled`

### 5-3. 불필요한 딜레이 제거

- 카테고리 간 `setTimeout(r, 300)` 제거
- `chunks()` 유틸 함수 제거 (불필요)

### 5-4. 타이밍 로그 추가

```typescript
console.log("[INGEST]", { ...stats, timing });
// timing: { fetchMs, summaryMs, insertMs, totalMs }
```

응답에도 `timing` 포함하여 모니터링 가능.

---

## 6. 예상 효과

| 모드 | Before | After |
|------|--------|-------|
| `summarize=false` | ~10초 (timeout) | **~2-3초** |
| `summarize=true` | ~15초+ (timeout) | **~3-5초** |
| Netlify 제한 | 10초 | 10초 (변경 없음) |

---

## 7. 배포 후 테스트 방법

1. **먼저**: `/api/news-ingest?summarize=false&secret=...`
   - `timing.totalMs < 10000` 확인
2. **그 다음**: `/api/news-ingest?summarize=true&secret=...`
   - `timing.totalMs < 10000` 확인
3. GitHub Actions Cron 정상 실행 확인

---

## 8. 교훈

- 502 에러 = 항상 서버 다운은 아님. **timeout도 502를 유발**
- 진단 시 실제 데이터(`/api/news-status`)를 먼저 확인해야 함
- GPT 초기 진단 "DB 죽음"은 실제 데이터와 모순 → **검증 없이 수용하면 안 됨**
- 순차 API 호출은 serverless 환경에서 치명적 → **병렬화 필수**

---

## 9. 커밋 정보

- **브랜치**: `claude/review-markdown-files-Pawh5`
- **커밋**: `Parallelize news ingest to prevent Netlify 10s timeout (502 fix)`
- **변경 파일**: `src/app/api/news-ingest/route.ts`
- **변경**: +43줄, -41줄
