# Topic 404 Fix Report

## GPT 진단 vs 실제 코드 상태

| GPT 진단 | 실제 |
|----------|------|
| `generateStaticParams` 있음 | **없음** |
| static generation 문제 | ISR 모드 (`revalidate = 300`) |
| `force-dynamic` 필요 | 불필요 — 캐시 정책 유지 |

## 실제 404 원인

`src/app/topic/[keyword]/page.tsx` 52번째 줄:

```typescript
if (articles.length === 0) {
  notFound();
}
```

DB 쿼리가 빈 결과를 반환하면 `notFound()`가 404를 반환하고, ISR이 이 404 응답을 **300초간 캐시**합니다.

한 번 빈 결과가 나오면 **5분간 해당 토픽 전체가 404로 고정**되는 구조였습니다.

## 수정 내용 (1파일, 2줄 변경)

| 변경 | 내용 |
|------|------|
| `notFound()` 제거 | 404 캐싱 방지 |
| 기사 수 표시 조건화 | 0개일 때 "· 0 articles" 숨김 |

### Before

```typescript
import { notFound } from "next/navigation";

// ...

if (articles.length === 0) {
  notFound();
}
```

### After

```typescript
// notFound 제거 — TopicArticleList가 이미 빈 상태 UI 처리함
// (TopicArticleList.tsx line 15-21: "No articles found for this topic.")
```

기사 수 표시:

```tsx
// Before
<p>Latest news and AI summaries about {decoded} · {articles.length} articles</p>

// After
<p>
  Latest news and AI summaries about {decoded}
  {articles.length > 0 && <> · {articles.length} articles</>}
</p>
```

## `force-dynamic`을 넣지 않은 이유

- ISR 캐시 정책(300s)이 CLAUDE.md에서 **확정, 수정 금지**로 지정됨
- `force-dynamic`은 `revalidate = 300`을 무력화함
- 진짜 문제는 `notFound()`가 404를 ISR 캐시에 넣은 것
- `notFound()` 제거만으로 충분

## 유지한 것

- `revalidate = 300` (캐시 정책 그대로)
- `TopicArticleList` 컴포넌트 — 이미 빈 상태 UI 처리 내장
- `articles.ts` 수정 없음
- TypeScript error 0

## 결론

GPT는 `generateStaticParams`가 원인이라고 진단했지만, 실제로는 존재하지 않았음. 실제 원인은 `notFound()` + ISR 캐시 조합이었음.
