# JubJub 뉴스 프로젝트 현황 보고서

> 작성일: 2026-03-11
> 사이트: https://headlines.fazr.co.kr
> 작성: Claude (AI 개발 어시스턴트)

---

## 1. 프로젝트 개요

JubJub 뉴스는 **RapidAPI 뉴스 API**로 기사를 수집하고, **Claude AI**로 요약을 생성하며, **Google Gemini**로 번역을 제공하는 한국어 뉴스 포털입니다.

### 기술 스택
| 구분 | 기술 |
|------|------|
| 프론트엔드 | Next.js (App Router), TypeScript, Tailwind CSS |
| 데이터베이스 | Supabase (PostgreSQL) |
| 배포 | Netlify |
| 뉴스 소스 | RapidAPI News API (`news-api14.p.rapidapi.com`) |
| AI 요약 | Anthropic Claude Haiku 4.5 |
| 번역 | Google Gemini 2.5 Flash |
| 스케줄링 | Netlify Scheduled Function (4시간 간격) |

### 아키텍처 흐름
```
RapidAPI → Netlify Function (4시간 스케줄) → /api/news-ingest → Supabase DB → Next.js 프론트엔드
```

---

## 2. 현재 발견된 문제점

### 🔴 문제 1: 영문 뉴스만 수집됨 (Critical)

**파일:** `src/app/api/news-ingest/route.ts`

```typescript
// 132번째 줄 - language가 "en"으로 하드코딩
async function fetchTrending(language: string = "en")

// 149번째 줄 - 마찬가지로 "en"
async function fetchByCategory(query: string, language: string = "en")

// 266번째 줄 - 호출 시에도 "en"
const trending = await fetchTrending("en");

// 272번째 줄 - 카테고리 검색도 "en"
const articles = await fetchByCategory(cat.query, "en");
```

**원인:** 뉴스 API를 호출할 때 언어 파라미터가 항상 `"en"` (영어)으로 설정되어 있어, 영문 기사만 수집됩니다.

**추가 문제:** 카테고리 검색어도 영문입니다:
```typescript
const CATEGORIES = [
  { name: "technology", query: "technology" },  // 영어 쿼리
  { name: "business", query: "business" },
  // ...
];
```
반면, 프론트엔드 카테고리 설정(`src/lib/categories.ts`)에는 한국어 쿼리가 있습니다:
```typescript
{ name: "정치", query: "한국 정치 국회", dbCategory: "world" }
```
→ **ingest 쪽 카테고리와 프론트엔드 카테고리가 완전히 다른 체계**로 되어 있습니다.

---

### 🔴 문제 2: AI 뉴스 카테고리 0건 (Critical)

**파일:** `src/app/ai/page.tsx`, `netlify/functions/news-ingest.ts`

AI 뉴스 페이지는 `summary`가 있는 기사만 표시합니다:
```typescript
// src/lib/articles.ts:113
export async function getArticlesWithSummary(limit: number = 30) {
  return supabase.from("articles").select("*")
    .not("summary", "is", null)
    .neq("summary", "")
    // ...
}
```

**그러나** 스케줄 함수가 요약 생성 파라미터 없이 호출합니다:
```typescript
// netlify/functions/news-ingest.ts:17
const url = `${SITE_URL}/api/news-ingest?secret=${INGEST_SECRET}`;
// ❌ ?summarize=true 파라미터가 없음!
```

요약은 `?summarize=true`가 있을 때만 생성됩니다:
```typescript
// src/app/api/news-ingest/route.ts:354
const shouldSummarize = req.nextUrl.searchParams.get("summarize") === "true";
```

→ **결과: summary가 항상 null → AI 뉴스 페이지 0건**

---

## 3. 카테고리 매핑 불일치

프론트엔드 카테고리와 DB 카테고리 간의 매핑이 혼란스럽습니다:

| 프론트엔드 (한국어) | DB 카테고리 | 실제 의미 |
|---------------------|-------------|-----------|
| 정치 | world | ❓ world와 정치는 다름 |
| 경제 | business | ✅ |
| 사회 | health | ❓ health와 사회는 다름 |
| 국제 | world | ⚠️ 정치와 같은 DB 카테고리 |
| 문화 | entertainment | ✅ |
| IT/과학 | technology | ✅ |
| 스포츠 | sports | ✅ |
| 오피니언 | science | ❓ science와 오피니언은 다름 |

→ 정치/국제가 같은 `world` 카테고리, 사회가 `health`, 오피니언이 `science`에 매핑되어 **카테고리 분류가 부정확**합니다.

---

## 4. 추가 발견 사항

### ⚠️ 한국어 키워드 추출 불가
```typescript
// src/app/api/news-ingest/route.ts:76
const words = text.replace(/[^a-z0-9\s]/g, "").split(/\s+/);
```
- 영문 소문자와 숫자만 남기는 정규식 → **한글이 모두 제거됨**
- 한국어 뉴스를 수집하더라도 키워드 추출이 불가능

### ⚠️ Slug 생성 문제
```typescript
// src/app/api/news-ingest/route.ts:43
.replace(/[^a-z0-9\s-]/g, "")  // 한글 제거
```
- 한글 제목으로 slug를 생성하면 빈 문자열이 됨
- 한국어 뉴스 수집 시 slug 충돌 문제 예상

### ⚠️ AI 요약이 영문으로 생성
```typescript
// route.ts:108
content: `Summarize this news article in 2-3 sentences (50-80 words)...`
```
- 프롬프트가 영어 → 영문 요약 생성
- 한국어 뉴스 포털에 영문 요약이 표시될 수 있음

### ✅ 정상 동작 항목
- Netlify 배포 정상
- Supabase DB 연결 정상
- 프론트엔드 UI 렌더링 정상
- 번역 기능 (Gemini API) 구성 완료
- 광고 (AdSense) 설정 완료
- 다크모드/라이트모드 지원

---

## 5. 해결 방안 제안

### Phase 1: 긴급 수정 (영문→한국어 뉴스)
1. **RapidAPI 한국어 지원 확인** — `language=ko` 파라미터가 동작하는지 테스트
2. 만약 한국어 미지원 시 → **대안 뉴스 API 탐색** 필요 (네이버 뉴스 API, NewsAPI.org 등)
3. 또는 **영문 뉴스를 Gemini로 한국어 번역** 후 저장하는 파이프라인 구축

### Phase 2: AI 뉴스 활성화
1. `netlify/functions/news-ingest.ts`에서 `?summarize=true` 추가
2. AI 요약 프롬프트를 한국어로 변경
3. 기존 DB 기사에 대해 일괄 요약 생성 스크립트 실행

### Phase 3: 카테고리 체계 정비
1. 한국 뉴스에 맞는 카테고리 재설계
2. DB 카테고리와 프론트엔드 카테고리 1:1 매핑
3. 한국어 키워드 추출 로직 구현 (형태소 분석 또는 n-gram)

### Phase 4: 한국어 완전 지원
1. Slug 생성 로직에 한글 지원 추가 (romanization 또는 hash 기반)
2. 키워드 추출 한국어 지원
3. 검색 기능 한국어 지원

---

## 6. 핵심 파일 맵

| 파일 | 역할 | 우선 수정 |
|------|------|-----------|
| `src/app/api/news-ingest/route.ts` | 뉴스 수집 파이프라인 | 🔴 |
| `netlify/functions/news-ingest.ts` | 스케줄 트리거 | 🔴 |
| `src/lib/categories.ts` | 카테고리 정의 | 🟡 |
| `src/lib/articles.ts` | DB 쿼리 함수 | 🟢 |
| `src/app/ai/page.tsx` | AI 뉴스 페이지 | 🟢 |
| `src/app/page.tsx` | 홈페이지 | 🟢 |
| `netlify/functions/translate-proxy.ts` | 번역 프록시 | 🟢 |

---

## 7. 협업 제안

이 프로젝트는 **복합적인 문제**(API 호환성, 다국어 처리, AI 파이프라인)가 얽혀 있어, 다음과 같은 역할 분담이 효과적입니다:

| 역할 | 담당 | 작업 |
|------|------|------|
| **아키텍처/코드 구현** | Claude | 코드 수정, 배포, 디버깅 |
| **리서치/전략 기획** | GPT | 한국어 뉴스 API 조사, 카테고리 체계 설계, 프롬프트 엔지니어링 |
| **의사결정/방향 설정** | 사용자 | 최종 결정, 우선순위 선정, 테스트 확인 |

### GPT에게 요청할 사항
1. RapidAPI `news-api14`의 한국어(`ko`) 지원 여부 확인
2. 한국어 뉴스 수집 대안 API 비교 (네이버, 다음, NewsAPI.org, GNews 등)
3. 한국 뉴스 카테고리 표준 체계 제안
4. 한국어 AI 요약 프롬프트 최적화 방안
5. 한국어 키워드 추출 방법론 (형태소 분석 라이브러리 등)

---

> **다음 단계:** 이 보고서를 GPT에게 공유하고, Phase 1(한국어 뉴스 소스 확보) 방안을 함께 결정한 후 코드 수정을 진행합니다.
