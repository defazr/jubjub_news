# JubJub News 운영/SEO/서버 검토 보고서

**작성일:** 2026-03-10
**검토 기준:** 운영 가능성, SEO, 서버 아키텍처, 성능

---

## 전체 평가

| 항목 | 평가 |
|------|------|
| 아키텍처 | 매우 좋음 |
| 구현 상태 | 약 90% 완료 |
| 운영 가능 여부 | 가능 |
| 남은 핵심 작업 | 3개 |

---

## 잘 구현된 부분

### 1. AI 뉴스 페이지 (`/ai`)

- summary가 있는 기사만 표시 + 최신순 + 키워드 태그
- 실질적으로 **AI 큐레이션 페이지** 역할
- 뉴스 사이트에서 실제로 많이 사용되는 패턴
- SEO 구조 적절함

### 2. 데이터 파이프라인

```
news-ingest CRON
 → RapidAPI 수집
 → AI 요약 생성
 → Supabase 저장
 → Next.js SSR 렌더링
```

- 뉴스 자동화 사이트 **정석 구조**
- AI 실행은 CRON에서만 수행, 사용자 요청 시 AI 실행 없음
- **비용 관리 관점에서 매우 중요한 설계**

### 3. 중복 처리

- `source_hash` UNIQUE 제약
- upsert 사용
- `existingHashes` 사전 체크
- **거의 완벽한 중복 방지 구조** (뉴스 사이트 흔한 문제를 이미 해결)

### 4. SSR 뉴스 페이지 (`/news/[slug]`)

- SSR + SEO metadata (title, description, OG, Twitter card)
- **검색 트래픽 핵심 페이지**로서 적절한 구조

---

## 주의 사항 및 개선 포인트

### 1. news-ingest 타임아웃 (중간 우선순위)

| 항목 | 현재 |
|------|------|
| 기사 80개 × AI 호출 | 약 96초 예상 |
| Netlify 함수 제한 | 10초 ~ 26초 |

- **첫 실행은 실패할 가능성 높음**
- 평상시 (신규 기사만 처리) 에는 문제없을 수 있음

**해결 방법:**
- `Promise.all` 병렬 실행
- 또는 batch 10개씩 처리

### 2. Claude API 호출 방식 (참고)

현재 `news-ingest.ts`에서 **raw fetch 직접 호출** 사용:

```typescript
// netlify/functions/news-ingest.ts:93
fetch("https://api.anthropic.com/v1/messages", {
  headers: {
    "x-api-key": ANTHROPIC_API_KEY,
    "anthropic-version": "2023-06-01",
  },
  body: JSON.stringify({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    ...
  }),
});
```

- SDK (`@anthropic-ai/sdk`) **미사용**
- 성능 튜닝 시 SDK 전환을 고려할 수 있음 (자동 재시도, 스트리밍 등)
- 현재 상태로도 동작에는 문제 없음

### 3. /ai 페이지 SEO 개선 (낮은 우선순위)

현재 meta description 개선 제안:

```
AI summarized global news updated every 4 hours.
```

검색 유입에 도움 됨.

---

## 남은 핵심 작업 3개

### 1. 홈페이지 DB 전환 (높음)

| 현재 | 목표 |
|------|------|
| 홈페이지 → RapidAPI 프록시 | 홈페이지 → Supabase |

- 이게 되면 **완전 DB 기반 뉴스 사이트**가 됨
- 가장 중요한 다음 단계

### 2. 카테고리 DB 전환 (높음)

| 현재 | 목표 |
|------|------|
| 카테고리 → `searchNews()` 프록시 | 카테고리 → `getArticlesByCategory()` |

### 3. sitemap 생성 (중간)

```
/sitemap.xml 포함 대상:
  - /news/[slug]
  - /topic/[keyword]
  - /ai
```

SEO에서 중요. 검색엔진 크롤링 효율화.

---

## 완료 시 최종 상태

위 3개 작업 완료 시:

```
뉴스 뷰어 → 완전 SEO 뉴스 플랫폼
```

| 기능 | 상태 |
|------|------|
| 뉴스 수집 | ✅ |
| AI 요약 | ✅ |
| DB 저장 | ✅ |
| 뉴스 페이지 | ✅ |
| 토픽 페이지 | ✅ |
| AI 페이지 | ✅ |
| 홈페이지 DB | ⬜ 다음 |
| 카테고리 DB | ⬜ 다음 |
| sitemap | ⬜ 다음 |

**뉴스 플랫폼 핵심 기능은 이미 구현 완료.**
현재는 **구조 안정화 단계.**

---

## 2차 검토 (2026-03-10)

### 전체 결론

**지금 상태면 실제 운영 시작 가능.** 트래픽 받기 전에 보완하면 좋은 것 5개 정리.

### 프로젝트 완성도 (세부)

| 영역 | 완성도 |
|------|--------|
| 뉴스 엔진 | 100% |
| 뉴스 플랫폼 | 90% |
| SEO 플랫폼 | 80% |

현재 단계: **구조 안정화**

---

### 보완 포인트 5개

#### 1. news-ingest 타임아웃 해결

현재 순차 실행 → 배치 병렬로 전환 필요:

```typescript
// 추천 구조
for (const batch of chunks(articles, 10)) {
  await Promise.allSettled(batch.map(generateSummary));
}
```

#### 2. AI 요약 입력 데이터 한계

현재 `generateSummary()` 입력:

```
Title: ${title}
Excerpt: ${excerpt}
```

- **본문(`/v2/article`)은 가져오지 않음**
- RapidAPI `RawArticle` 인터페이스: `title`, `url`, `excerpt`, `thumbnail`, `date`, `publisher`만 포함
- excerpt는 보통 1~3문장 수준
- 150~200단어 요약을 1~3문장 excerpt로 생성하는 것은 **환각(hallucination) 위험** 있음

**개선 방안:**
- 요약 길이를 50~80단어로 줄이거나
- `/v2/article` 엔드포인트로 본문 수집 후 요약 (API 비용/시간 증가)
- 또는 요약 대신 "AI 핵심 포인트" 형태로 전환 (간결한 bullet point)

#### 3. sitemap 분리 구조

뉴스 사이트 권장:

```
/sitemap.xml          (인덱스)
/sitemap-news.xml     (뉴스 기사)
/sitemap-topics.xml   (토픽 페이지)
```

2~3개 분리가 크롤링 효율에 좋음.

#### 4. /ai 페이지 SEO 강화

meta description 개선:

```
AI summarized global news updated every 4 hours.
```

타겟 키워드:
- `AI summarized news`
- `AI curated news`
- `AI news digest`

#### 5. /topic 페이지 트래픽 전략

`/topic/[keyword]` 페이지가 실질적 트래픽 유입 핵심:

```
/topic/ai
/topic/openai
/topic/nvidia
```

검색 유입 대부분은 이런 페이지에서 발생. sitemap에 반드시 포함.

---

### 다음 작업 순서

| 순서 | 작업 | 우선순위 |
|------|------|----------|
| 1 | 홈페이지 DB 전환 | 높음 |
| 2 | 카테고리 DB 전환 | 높음 |
| 3 | sitemap 생성 | 중간 |

이 3개 완료 시 → **완전 SEO 뉴스 사이트**

---

### 다음 단계

홈페이지 DB 전환 보고서 완료 후 → 트래픽 구조 + 광고 수익 관점 최종 점검 예정.

---

## 3차 검토 — 개발/운영 관점 피드백 (2026-03-10)

### 전체 평가

| 항목 | 평가 |
|------|------|
| 아키텍처 | 매우 안정적 |
| 운영 가능 여부 | 가능 |
| 구현 완성도 | 약 90% |
| 실제 서비스 시작 | 가능 |

현재 단계: **뉴스 자동화 엔진 → SEO 뉴스 플랫폼 전환 단계**
핵심 기능은 이미 다 들어가 있음.

---

### 1. AI 요약 입력 구조 판단

현재 `title + excerpt`만 사용하는 방식은 많은 뉴스 애그리게이터가 쓰는 방식이라 문제 없음.

다만 **150~200단어 요약은 길다.** excerpt가 1~3문장이기 때문.

**추천 방식: 50~80단어 요약 또는 AI 핵심 포인트 4개**

```
AI Key Points
• Nvidia announced new AI chip
• Production expected in 2026
• Major cloud companies interested
• Stock price rose after announcement
```

이 방식의 장점:
- 환각 위험 감소
- 읽기 속도 향상
- SEO 유지

### 2. /v2/article 본문 수집 판단

| 항목 | 평가 |
|------|------|
| 장점 | 요약 품질 상승 |
| 단점 | API 호출 증가, CRON 시간 증가, 파싱 실패 가능 |

**결론: 초기 단계에서는 현재 방식 (title + excerpt) 유지가 맞음.**
트래픽 커지면 그때 본문 수집 추가.

### 3. news-ingest 타임아웃

80 기사 × AI 호출 ≈ 96초, Netlify 제한 10~26초.

**추천 수정:** batch 병렬 처리

```typescript
for (const batch of chunks(articles, 10)) {
  await Promise.allSettled(batch.map(a => generateSummary(a.title, a.excerpt)));
}
```

다음 단계에서 수정 요청. 지금은 테스트 먼저.

### 4. SEO 구조 평가

현재 `/news/[slug]`, `/topic/[keyword]`, `/ai` 구조는 뉴스 SEO에서 매우 좋음.

**특히 `/topic` 페이지가 실제 트래픽을 먹는 페이지:**

```
/topic/ai
/topic/openai
/topic/nvidia
```

뉴스 사이트 트래픽 상당 부분이 여기서 발생.

### 5. sitemap 구조

보고서에서 제안한 구조 그대로 사용:

```
/sitemap.xml          (인덱스)
/sitemap-news.xml     (뉴스 기사)
/sitemap-topics.xml   (토픽 페이지)
```

Google 크롤링 속도 향상에 좋음.

---

### 완성도 (세부)

| 영역 | 완성도 |
|------|--------|
| 뉴스 엔진 | 100% |
| 뉴스 플랫폼 | 90% |
| SEO 플랫폼 | 80% |

**뉴스 엔진 단계는 끝남. 현재 SEO 확장 단계.**

---

### 남은 핵심 3개

| 순서 | 작업 | 우선순위 |
|------|------|----------|
| 1 | 홈페이지 DB 전환 | 높음 |
| 2 | 카테고리 DB 전환 | 높음 |
| 3 | sitemap 생성 | 중간 |

이 3개 완료 시 → **완전 SEO 뉴스 플랫폼**

---

### 추가 제안: keyword auto page 강화

트래픽을 먹는 핵심 페이지는 `/topic/[keyword]`.

다음 단계에서 강화할 키워드 페이지 예시:

```
/topic/ai
/topic/tesla
/topic/openai
/topic/nvidia
```

이 페이지가 실제 검색 트래픽을 만든다.

---

### 결론

JubJub 프로젝트는 **뉴스 자동화 플랫폼**으로 이미 거의 완성.

홈페이지 DB 전환 보고서 완료 시 → SEO 구조 + 광고 수익 구조 + 트래픽 성장 구조 최종 점검 예정.

---

## 최종 검토 — 운영 기준 종합 판단 (2026-03-10)

### 프로젝트 현재 위치

| 영역 | 완성도 |
|------|--------|
| 뉴스 엔진 | 100% |
| 뉴스 플랫폼 | 90% |
| SEO 플랫폼 | 80% |

현재 단계: **엔진 개발 → SEO 확장 단계** 전환 중. 운영 시작 문제 없음.

---

### 가장 잘된 부분

#### 1. 데이터 파이프라인

```
RapidAPI → news-ingest CRON → Claude 요약 → Supabase 저장 → Next.js SSR
```

- 실제 뉴스 플랫폼에서 사용하는 정석 구조
- AI 실행 = CRON에서만, 사용자 요청 = DB 읽기만
- **비용/안정성 측면에서 매우 좋은 설계**

#### 2. 중복 처리

- `source_hash` UNIQUE + `existingHashes` + upsert
- 뉴스 중복 문제 거의 발생하지 않음
- **뉴스 플랫폼 흔한 문제를 이미 해결**

#### 3. SEO 페이지 구조

```
/news/[slug]      → 개별 기사 (SSR + SEO metadata)
/topic/[keyword]  → 트래픽 핵심 페이지
/ai               → AI 큐레이션 페이지
```

- 뉴스 SEO에서 매우 좋은 구조
- `/topic/[keyword]`가 실제 검색 트래픽을 만드는 페이지

---

### 운영 기준 완료 현황

| 기능 | 상태 |
|------|------|
| 뉴스 수집 | ✅ 완료 |
| AI 요약 | ✅ 완료 |
| DB 저장 | ✅ 완료 |
| 뉴스 페이지 | ✅ 완료 |
| 토픽 페이지 | ✅ 완료 |
| AI 페이지 | ✅ 완료 |
| 홈페이지 DB | ⬜ 남음 |
| 카테고리 DB | ⬜ 남음 |
| sitemap | ⬜ 남음 |

---

### 남은 핵심 작업 3개

| 순서 | 작업 | 우선순위 |
|------|------|----------|
| 1 | 홈페이지 DB 전환 | 높음 |
| 2 | 카테고리 DB 전환 | 높음 |
| 3 | sitemap 생성 | 중간 |

이 3개 완료 시 → **완전 SEO 뉴스 플랫폼**

---

### 다음 단계 보완 포인트 요약

| 항목 | 현재 | 추천 |
|------|------|------|
| AI 요약 길이 | 150~200단어 | 50~80단어 또는 Key Points 4개 |
| news-ingest | 순차 실행 (96초) | batch 병렬 처리 (10개씩) |
| sitemap | 없음 | 3분할 구조 (index/news/topics) |
| /topic 페이지 | 기본 구현 | keyword page 강화 |

---

### 최종 결론

JubJub 프로젝트는 **뉴스 자동화 플랫폼**으로 이미 거의 완성.
현재 상태는 **구조 안정화 단계**.

다음 보고서가 homepage DB 전환이면 그때 **SEO 구조 + 트래픽 성장 전략 + 광고 수익 구조** 최종 운영 설계 점검 예정.
