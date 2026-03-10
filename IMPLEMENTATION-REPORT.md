# Headlines News Platform — Implementation Report

## Overview

API 기반 뉴스 뷰어를 SEO 뉴스 플랫폼으로 전환하는 작업의 1단계 구현 완료 보고서.

---

## 생성된 파일 (10개)

### 1. `src/lib/supabase.ts`
Supabase 클라이언트 (public 읽기용 + admin 쓰기용)

### 2. `src/types/database.ts`
articles 테이블 TypeScript 타입 정의 (Row, Insert, Update)

### 3. `supabase/schema.sql`
articles 테이블 스키마 + 인덱스 + RLS 정책
- `slug` UNIQUE
- `source_hash` UNIQUE (중복 방지)
- GIN 인덱스 (keywords 배열 검색)
- RLS: 공개 읽기, 서비스 키로만 쓰기

### 4. `src/lib/slug.ts`
slug 생성기 + source_hash 중복 감지 유틸리티

### 5. `src/lib/articles.ts`
DB 쿼리 헬퍼:
- `getArticleBySlug()` — 개별 기사 조회
- `getArticlesByCategory()` — 카테고리별 조회
- `getArticlesByKeyword()` — 키워드별 조회
- `getRelatedArticles()` — 관련 뉴스
- `getPopularKeywords()` — 인기 키워드
- `getTrendingArticles()` — 트렌딩 기사

### 6. `netlify/functions/news-ingest.ts`
뉴스 수집 CRON 함수:
- 4시간 간격 자동 실행 (Netlify Scheduled Functions)
- 8개 카테고리 + trending 수집
- `source_hash` 기반 중복 제거 (코드 레벨 + DB UNIQUE)
- 키워드 자동 추출
- **Claude Haiku API로 AI 요약 생성 (150-200 단어)**
- 수동 트리거 지원 (`?secret=` 파라미터)

### 7. `src/app/news/[slug]/page.tsx`
기사 페이지 (SSR):
- SEO 메타데이터 (title, description, OG, Twitter Card)
- 동적 서버 렌더링
- 관련 뉴스 조회

### 8. `src/app/news/[slug]/ArticleContent.tsx`
기사 본문 클라이언트 컴포넌트:
- 이미지, AI 요약 표시, 관련 뉴스
- 광고 슬롯 3개 (상단, 중간, 하단)
- 키워드 태그 → `/topic/[keyword]` 링크
- 북마크, 공유 버튼

### 9. `src/app/topic/[keyword]/page.tsx`
토픽 페이지 (SSR):
- 키워드 기반 기사 목록
- SEO 메타데이터

### 10. `src/app/topic/[keyword]/TopicArticleList.tsx`
토픽 기사 그리드 컴포넌트

---

## 수정된 파일 (4개)

### 1. `next.config.ts`
- `output: "export"` 제거 → SSR 활성화

### 2. `netlify.toml`
- `publish: ".next"` (기존 `out`)
- `@netlify/plugin-nextjs` 추가

### 3. `package.json`
- `@supabase/supabase-js` 추가
- `@netlify/plugin-nextjs` 추가

### 4. `package-lock.json`
- 의존성 락파일 업데이트

---

## 아키텍처 변경

### Before
```
RapidAPI → Netlify Proxy → Browser → Memory Cache → UI
```

### After
```
RapidAPI → CRON Ingestion → Claude Haiku 요약 → Supabase DB → Next.js SSR → User
```

---

## 빌드 결과

| 타입 | 페이지 |
|------|--------|
| Static | `/`, `/article`, `/bookmarks`, `/category/*`, `/search`, `/world` |
| Dynamic SSR | `/news/[slug]`, `/topic/[keyword]` |

빌드 성공 확인 완료.

---

## GPT 검증 3가지 항목

### 1. AI 요약 생성 위치 ✅
- `news-ingest.ts` → `generateSummary()` 함수
- CRON 수집 단계에서 Claude Haiku API 호출
- 요약을 DB `summary` 컬럼에 저장
- 사용자 요청 시 AI 실행 없음 (DB에서 읽기만)

### 2. 중복 기사 처리 ✅
- `source_hash` UNIQUE 제약조건 (DB 레벨)
- 코드 레벨 `existingHashes` Set으로 사전 필터링
- `upsert` + `ignoreDuplicates: true` (최종 안전장치)
- 3중 보호

### 3. CRON 자동 실행 ✅
- Netlify Scheduled Functions 사용
- `schedule: "0 */4 * * *"` (매 4시간, 하루 6회)
- 외부 CRON 불필요

---

## 남은 수동 작업

1. **Supabase SQL Editor**에서 `supabase/schema.sql` 실행
2. **Netlify 환경변수** 추가:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ANTHROPIC_API_KEY`
3. 배포 후 `news-ingest` 수동 트리거로 첫 수집 테스트
4. DB 데이터 확인 후 → 홈페이지 DB 쿼리 전환 (Phase 2)

---

## 다음 단계 (Phase 2)

- 홈페이지를 DB 쿼리로 전환
- 카테고리 페이지를 DB 쿼리로 전환
- 기존 API proxy 제거
- sitemap.xml 동적 생성
