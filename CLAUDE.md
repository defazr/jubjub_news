# Headlines Fazr - Claude 작업 지시서

## 프로젝트 정보

- **사이트**: https://headlines.fazr.co.kr
- **아키텍처**: RapidAPI → /api/news-ingest → Claude AI summary → Supabase → Next.js ISR
- **상태**: 개발 완료. 운영 단계.

## 현재 시스템 상태 (2026-03-11 기준)

| 영역 | 상태 |
|------|------|
| 뉴스 수집 | 정상 (/api/news-ingest) |
| AI 요약 | 정상 (Claude Haiku) |
| 번역 | 정상 (/api/translate) |
| DB | articles 231+ / summary backfill 필요 |
| SEO 메타 | 정상 (og, twitter, canonical) |
| sitemap | 정상 (sitemap.xml, sitemap-news.xml, sitemap-topics.xml) |
| robots.txt | 정상 |
| 광고 | 정상 (AdSense - top/mid/bottom) |
| 검색엔진 등록 | 완료 (Google, Naver, Bing) |

## 페이지 구조

```
/                    → 홈페이지
/ai                  → AI 요약 뉴스
/news/[slug]         → 기사 페이지
/topic/[keyword]     → 토픽 페이지
/category/[slug]     → 카테고리 페이지
/search              → 검색
```

## 핵심 파일

| 파일 | 역할 |
|------|------|
| src/lib/articles.ts | DB 쿼리 (getArticlesByKeyword, getPopularKeywords 등) |
| src/app/topic/[keyword]/page.tsx | Topic SEO 페이지 |
| src/app/news/[slug]/page.tsx | 기사 SEO 페이지 |
| src/app/ai/AiArticleList.tsx | AI 기사 리스트 (mid-ai 광고 포함) |
| src/components/AdUnit.tsx | AdSense 광고 컴포넌트 (SLOT_MAP) |
| src/app/api/backfill-summaries/route.ts | AI summary backfill API |
| src/app/api/news-ingest/route.ts | 뉴스 수집 API |
| src/app/sitemap-topics.xml/route.ts | Topic sitemap (CORE_KEYWORDS + DB) |
| src/lib/categories.ts | 카테고리 매핑 |

## Backfill 실행 방법

```
GET /api/backfill-summaries?secret=INGEST_SECRET&limit=50
```
- summary 없는 기사에 AI 요약 생성
- 50개씩 실행, 약 5회 반복으로 전체 처리

## Topic 검색 구조

```typescript
// src/lib/articles.ts
.or(`keywords.cs.{${keyword}},title.ilike.%${keyword}%`)
```
- keywords contains OR title ILIKE 방식
- category 기반 필터 아님

## 광고 슬롯 매핑 (AdUnit.tsx)

| 슬롯 | AdSense ID |
|------|-----------|
| top-article | 9121339058 |
| mid-article | 2248808942 |
| bottom-article | 9121339058 |
| top-ai | 9121339058 |
| mid-ai | 2248808942 |
| bottom-ai | 2248808942 |
| top-home | 9121339058 |
| bottom-home | 2248808942 |
| top-topic | 9121339058 |
| bottom-topic | 2248808942 |

## 카테고리 매핑 (검토 필요)

| 카테고리 | dbCategory | 비고 |
|---------|-----------|------|
| 정치 | world | 국제와 중복 |
| 경제 | business | |
| 사회 | health | |
| 국제 | world | 정치와 중복 |
| 문화 | entertainment | |
| IT/과학 | technology | |
| 스포츠 | sports | |
| 오피니언 | science | 매핑 이상 |

## 작업 원칙

1. **아키텍처 변경 금지**: RapidAPI → ingest → Supabase → Next.js
2. **UI 변경 최소화**
3. **API 구조 변경 금지**
4. **DB schema 변경 금지**

## Topic Sitemap 기본 키워드

sitemap-topics.xml에 항상 포함되는 키워드:
```
ai, chatgpt, openai, nvidia, apple, tesla, microsoft, google, meta,
amazon, bitcoin, crypto, startup, semiconductor, iphone, android,
robot, space, quantum, gpu, gpt5, gemini, copilot, deepseek,
anthropic, samsung, economy, climate, cybersecurity, 5g, ev, cloud
```
+ DB에서 자동 추출되는 인기 키워드 (최대 200개)

## 다음 단계 (트래픽 성장)

1. Topic 페이지 트래픽 확장 (Google Discover + Google News)
2. 자동 키워드 생성 (기사 keywords 기반)
3. Trending Topics 확장
4. Google News 정식 신청
