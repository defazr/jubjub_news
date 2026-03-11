# JubJub News 프로젝트 현황 및 작업 계획서

## 1. 프로젝트 개요

- **사이트**: https://headlines.fazr.co.kr
- **목적**: RapidAPI 뉴스 수집 → Claude AI 요약 → Gemini 번역 → SEO 뉴스 플랫폼
- **스택**: Next.js 16 + Supabase + Netlify + Tailwind/shadcn
- **데이터 흐름**: RapidAPI → `/api/news-ingest` → Claude Haiku 요약 → Supabase → Next.js ISR

---

## 2. 현재 구조

### 페이지
| 경로 | 설명 | 상태 |
|---|---|---|
| `/` | 홈 (트렌딩 + 카테고리별 뉴스) | 정상 |
| `/ai` | AI summary 기사 모음 | 기사 부족 (summary 5개) |
| `/news/[slug]` | 개별 기사 페이지 | 정상 |
| `/topic/[keyword]` | 키워드별 기사 모음 | 수정 완료 (title ILIKE 추가) |
| `/world` | 글로벌 뉴스 (카테고리 필터) | 정상 |
| `/category/[slug]` | 8개 카테고리 페이지 | 정상 |
| `/search` | 검색 | 정상 |

### API
| 경로 | 설명 | 상태 |
|---|---|---|
| `/api/news-ingest` | RapidAPI 수집 + AI 요약 | 정상 |
| `/api/translate` | Gemini 번역 | 정상 |
| `/api/backfill-summaries` | 기존 기사 AI 요약 생성 | 존재, 미실행 |
| `/api/articles` | 기사 조회/검색/디버그 | 정상 |

### SEO/인프라
| 항목 | 상태 |
|---|---|
| `robots.txt` | 존재 (Daum 인증 포함) |
| `sitemap.xml` | 존재 (sitemap-news + sitemap-topics 인덱스) |
| `sitemap-news.xml` | 존재 (기사 + 카테고리, 1시간 갱신) |
| `sitemap-topics.xml` | 존재 (인기 키워드 200개, 1시간 갱신) |
| OpenGraph/Twitter 메타 | 기사 페이지에 적용됨 |
| Naver/Google 사이트 인증 | layout.tsx에 meta 태그 존재 |

### 카테고리 매핑 (`src/lib/categories.ts`)
| 프론트 표시 | DB 카테고리 |
|---|---|
| 정치 | world |
| 경제 | business |
| 사회 | health |
| 국제 | world |
| 문화 | entertainment |
| IT/과학 | technology |
| 스포츠 | sports |
| 오피니언 | science |

### 광고 슬롯
| 페이지 | 슬롯 수 | 상세 |
|---|---|---|
| 홈 | 5 | 상단, 중간, 하단, 사이드바 ×2 |
| AI | 2 | top-ai, bottom-ai |
| 기사 | 3 | top-article, mid-article, bottom-article |
| 토픽 | 2 | top-topic, bottom-topic |

### DB 현황
- 전체 기사: 228개
- AI summary 있는 기사: 5개
- 나머지 223개: summary 없음 (backfill 필요)

---

## 3. 완료된 작업 (이번 세션)

1. **번역 방향 수정**: `translateTexts(..., "en")` → `"ko"`로 변경
   - 수정 파일: `HomeContent.tsx`, `CategoryPage.tsx`, `search/page.tsx`
   - `world/page.tsx`는 이미 `"ko"`로 정상
2. **Topic 검색 개선**: `getArticlesByKeyword` 쿼리에 `title.ilike` 추가
   - `.contains("keywords", [keyword])` → `.or(keywords.cs + title.ilike)`

---

## 4. 남은 작업 (GPT 검토 후 진행)

### 작업 A: AI 페이지 광고 슬롯 추가
- **현재**: top-ai, bottom-ai (2개)
- **목표**: 기사 목록 중간에 mid-ai 광고 1개 추가
- **수정 파일**: `src/app/ai/AiArticleList.tsx` (클라이언트 컴포넌트)

### 작업 B: 기존 기사 AI summary backfill
- **현재**: `/api/backfill-summaries` API 존재, Claude Haiku 4.5 사용
- **필요**: 배포 환경에서 실행 (223개 기사 summary 생성)
- **호출**: `GET /api/backfill-summaries?secret=INGEST_SECRET&limit=50`

### 작업 C: 카테고리 체계 점검
- **현재 매핑 문제**: 정치/국제 둘 다 `world`에 매핑됨
- **오피니언이 `science`에 매핑** — 의도적인지 확인 필요
- **수정 파일**: `src/lib/categories.ts`

### 작업 D: SEO 등록 (수동 작업)
- Google Search Console 등록
- Naver Search Advisor 등록
- Bing Webmaster 등록
- Daum 웹마스터 등록 (robots.txt에 인증 있음)

---

## 5. 작업 원칙

- 기존 아키텍처 변경 금지 (RapidAPI → ingest → Supabase → Next.js)
- UI 변경 최소화
- GPT 지시서 기반으로만 작업 진행
- 임의 수정 금지
