# AI 검색 및 카테고리 문제점 분석 (2026-03-25)

## 상태: 보류 (수정 금지, 3~4주 후 처리)

---

## 발견된 문제 3건

### 1. /ai 페이지 — 카테고리 필터 없음

- 파일: `src/app/ai/page.tsx`
- 함수: `getArticlesWithSummary(30)` (src/lib/articles.ts:174)
- 문제: summary가 있는 기사 30개를 최신순으로 가져올 뿐, 카테고리/키워드 필터 없음
- 결과: 스포츠, 경제 등 AI와 무관한 기사도 전부 노출
- 페이지 타이틀 "AI Curated News"와 실제 콘텐츠 불일치
- 영향: SEO relevance 불일치, Discover 품질 평가에 부정적 가능성

### 2. /topic/ai 페이지 — ilike %ai% false positive

- 파일: `src/lib/topicConcepts.ts:135` (getArticlesByConceptTopic)
- 문제: `title.ilike.%ai%`, `excerpt.ilike.%ai%` 조건이 포함됨
- "ai"는 2글자라 "said", "again", "against", "campaign", "air", "wait" 등에 매칭
- AI 무관 기사가 대량 포함됨
- TOPIC_CONCEPTS["ai"]의 keywords.cs 조건은 정상 (13개 키워드 확장)

### 3. /category/ai — 페이지 파일 누락 (404)

- `src/app/category/ai/page.tsx` 파일 없음
- 운영 로그(3/19)에는 생성 기록 있으나 현재 코드에 없음
- categories.ts에 AI 정의 있음 (slug: "ai", dbCategory: "ai")
- next.config에 리다이렉트 없음
- **단, 내부 어디에서도 /category/ai 링크를 걸고 있지 않음**
- **사용자 접근 경로 없음 → 실제 영향 거의 0**

---

## 판단 기준

> "이 수정이 지금 트래픽에 영향 있냐?" → **NO**

- Google이 사이트 평가 중인 상태
- 구조 변경 → relevance 재평가 → Discover 테스트 리셋 가능
- 지금은 "정확도"보다 "흐름 유지"가 중요

---

## 수정 금지 사항 (현재)

- 필터 로직 변경 ❌
- 검색 조건 변경 ❌
- 페이지 의미 변경 ❌
- 새 페이지 생성 ❌

---

## 실행 트리거 조건

아래 조건 중 하나라도 충족 시 수정 시작:

- impressions 증가 멈춤 (3일 이상 정체)
- 색인 수 증가 멈춤
- 특정 페이지 CTR 0 유지

---

## 수정 우선순위 (리스크 낮은 것부터)

1. /category 리다이렉트 (리스크 최소)
2. /topic/ai 검색 정확도 개선
3. /ai 페이지 필터 또는 타이틀 수정

---

## 3~4주 후 처리 체크리스트

### 1순위: /category/ai

- [ ] 옵션 A: /category/:slug → /topic/:slug 301 리다이렉트 추가 (next.config.ts)
- [ ] 옵션 B: /category/ai/page.tsx 재생성
- [ ] 옵션 A 추천 (구조 변경 최소)

### 2순위: /topic/ai 검색 정확도

- [ ] title.ilike.%ai%, excerpt.ilike.%ai% 제거
- [ ] keywords.cs 조건만 유지 (13개 키워드로 충분)
- [ ] 또는 ilike 패턴을 단어 경계 고려로 변경 ("% ai %", "ai %")

### 3순위: /ai 페이지

- [ ] getArticlesWithSummary에 카테고리 필터 추가 또는 별도 함수 생성
- [ ] articles.ts 수정 금지이므로 topicConcepts.ts 등에 새 함수 추가 방식 권장
- [ ] 또는 페이지 타이틀을 "AI-Summarized News"로 변경하여 의미 맞춤

---

## 관련 파일

| 파일 | 역할 |
|------|------|
| src/app/ai/page.tsx | /ai 페이지 |
| src/lib/articles.ts | getArticlesWithSummary (수정 금지) |
| src/lib/topicConcepts.ts | getArticlesByConceptTopic, TOPIC_CONCEPTS |
| src/lib/categories.ts | CATEGORIES, HOMEPAGE_CATEGORIES |
| src/app/topic/[keyword]/page.tsx | /topic/ai 페이지 |
| src/app/category/*/page.tsx | 카테고리 페이지들 (ai 없음) |
