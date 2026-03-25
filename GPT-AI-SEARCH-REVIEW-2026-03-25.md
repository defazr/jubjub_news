# GPT 핸드오프: AI 검색/카테고리 문제 분석 (2026-03-25)

## 프로젝트

- 사이트: https://headlines.fazr.co.kr
- 스택: Next.js + Supabase + Claude AI summary
- 호스팅: Netlify
- 상태: 운영 중, Google Discover 진입 대기

---

## 현재 발견된 문제 (3건, 전부 보류)

### 문제 1: /ai 페이지에 AI 아닌 뉴스 노출

/ai 페이지는 getArticlesWithSummary(30) 함수를 사용한다. 이 함수는 summary 필드가 비어있지 않은 최신 기사 30개를 가져올 뿐, 카테고리나 키워드 필터가 없다. 페이지 타이틀은 "AI Curated News"이지만 실제로는 AI가 요약한 모든 카테고리의 뉴스를 보여준다. 사용자가 AI 관련 뉴스를 기대하고 들어왔을 때 스포츠, 경제 등 무관한 기사가 섞여 있다.

관련 파일: src/app/ai/page.tsx, src/lib/articles.ts (174행, 수정 금지 파일)

### 문제 2: /topic/ai 검색에서 false positive 과다

/topic/ai는 topicConcepts.ts의 getArticlesByConceptTopic 함수를 사용한다. TOPIC_CONCEPTS에서 ai를 13개 관련 키워드(openai, chatgpt, gemini 등)로 확장하여 keywords.cs 조건으로 검색하는 것까지는 정상이다. 문제는 추가로 title.ilike.%ai%와 excerpt.ilike.%ai% 조건이 포함되어 있다는 점이다. "ai"는 2글자이므로 "said", "again", "against", "campaign", "air" 등 수많은 영단어에 매칭되어 AI와 무관한 기사가 대량으로 결과에 포함된다.

관련 파일: src/lib/topicConcepts.ts (135행)

### 문제 3: /category/ai 페이지 404

categories.ts에 AI 카테고리가 정의되어 있고(slug: "ai", dbCategory: "ai") HOMEPAGE_CATEGORIES에도 등록되어 있다. 운영 로그(3/19)에 page.tsx 생성 기록이 있으나 현재 코드에 파일이 없다. 리다이렉트도 없다. 단, 코드 내부 어디에서도 /category/ai 링크를 걸고 있지 않아 사용자가 이 404에 도달할 경로가 없다. 실제 영향은 거의 0이다.

관련 파일: src/app/category/ (ai 디렉토리 없음), src/lib/categories.ts

---

## 왜 지금 수정하면 안 되는가

Google이 사이트를 평가 중이다. Discover 진입을 대기하고 있는 상태에서 페이지 내용이 바뀌면 relevance 재평가가 발생하고 Discover 테스트가 리셋될 수 있다. 세 가지 문제 모두 현재 트래픽에 직접적 영향이 없으므로, 안정성을 유지하는 것이 우선이다.

위험한 행동: 필터 로직 변경, 검색 조건 변경, 페이지 의미 변경, 새 페이지 생성

---

## 3~4주 후 수정 계획

/ai 페이지: articles.ts는 수정 금지이므로 topicConcepts.ts 등에 카테고리 필터가 포함된 새 함수를 만들거나, 페이지 타이틀을 실제 기능에 맞게 변경한다.

/topic/ai: title.ilike.%ai%와 excerpt.ilike.%ai% 조건을 제거하고 keywords.cs 조건만 유지한다. 13개 확장 키워드로 충분하다.

/category/ai: next.config.ts에 /category/:slug → /topic/:slug 301 리다이렉트를 추가하는 것이 가장 안전하다.

---

## 수정 금지 파일 (CLAUDE.md 규칙)

- src/lib/articles.ts
- src/app/api/news-ingest/route.ts
- Supabase schema

---

## 핵심 판단 기준

"이 수정이 지금 트래픽에 영향 있냐?" → NO → 보류
