# JubJub News - 현재 상태 및 문제 해결 가이드

## 현재 상태 요약

### Phase 3 완료 작업
1. **news-proxy 완전 제거** — `netlify/functions/news-proxy.ts` 삭제
2. **모든 페이지 Supabase DB 전환 완료**
   - 홈페이지, 카테고리, 해외뉴스, 검색 → 모두 Supabase에서 조회
3. **Topic 페이지 SEO 강화** — OG tags, canonical, 관련 토픽 internal linking
4. **API route 생성** — `/api/articles` (클라이언트 페이지용)

### 현재 데이터 흐름
```
[뉴스 수집]
RapidAPI → news-ingest (4시간 CRON) → Claude 요약 → Supabase DB 저장

[사용자 요청]
홈페이지/카테고리/토픽 (SSR) → articles.ts → Supabase DB 조회
해외뉴스/검색 (Client) → /api/articles → Supabase DB 조회
```

---

## 뉴스가 안 나오는 원인 (확인됨)

### 에러 로그

```
Could not find the table 'public.articles' in the schema cache
```

### 원인

**Supabase에 `articles` 테이블이 존재하지 않음** — DB 스키마를 한 번도 만들지 않은 상태.

| 항목 | 상태 |
|------|------|
| 환경변수 | 정상 |
| Supabase 연결 | 정상 |
| DB 테이블 | **없음** |

코드가 아무리 잘 되어있어도, 테이블이 없으면 모든 쿼리가 실패한다.

---

## 해결 방법 (3분)

### 1단계: Supabase SQL Editor 열기

1. [Supabase 대시보드](https://supabase.com/dashboard) 접속
2. 프로젝트 **wzxayrmkykzxmujejyzg** 선택
3. 왼쪽 메뉴에서 **SQL Editor** 클릭

### 2단계: 아래 SQL 전체를 복사하여 실행

이 내용은 프로젝트의 `supabase/schema.sql` 파일과 동일합니다.

```sql
-- JubJub Headlines - Articles Table Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  summary text,
  excerpt text,
  source_url text NOT NULL,
  image_url text,
  publisher text,
  category text NOT NULL,
  keywords text[] DEFAULT '{}',
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  source_hash text UNIQUE NOT NULL
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles (slug);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles (category);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_keywords ON articles USING GIN (keywords);

-- RLS: Enable and allow public read access
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON articles
  FOR SELECT USING (true);

CREATE POLICY "Service role insert" ON articles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role update" ON articles
  FOR UPDATE USING (true);
```

**RUN** 버튼 클릭.

### 3단계: 테이블 생성 확인

왼쪽 메뉴 → **Table Editor** → `articles` 테이블이 보이면 성공.

### 4단계: news-ingest 수동 실행

브라우저에서 아래 URL 호출:

```
https://headlines.fazr.co.kr/.netlify/functions/news-ingest?secret=sb_secret_C1bcaG6
```

> `secret` 값은 `SUPABASE_SERVICE_ROLE_KEY`의 앞 16글자입니다.

성공 시 응답 예시:
```json
{
  "success": true,
  "stats": {
    "fetched": 150,
    "inserted": 120,
    "duplicates": 30,
    "errors": 0,
    "summaries": 80
  }
}
```

### 5단계: 홈페이지 확인

ISR 캐시가 있으므로 최대 **5분 후** 뉴스가 표시됩니다.

---

## 추가 문제 발생 시

### debug 엔드포인트

```
https://headlines.fazr.co.kr/api/articles?action=debug
```

| 결과 | 의미 | 해결 |
|------|------|------|
| `totalArticles: 0` | 테이블은 있지만 비어있음 | news-ingest 수동 실행 |
| `hasServiceKey: false` | 환경변수 미설정 | Netlify에 `SUPABASE_SERVICE_ROLE_KEY` 추가 |
| `error: "permission denied..."` | RLS 정책 문제 | 위 SQL의 RLS 부분 재실행 |
| `error: "relation ... does not exist"` | 테이블 미생성 | 위 SQL 전체 실행 |

### 필요한 Netlify 환경변수

| 변수명 | 설명 |
|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (공개) 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role (관리자) 키 |
| `RAPIDAPI_KEY` | RapidAPI 뉴스 API 키 |
| `ANTHROPIC_API_KEY` | Claude AI 요약용 API 키 |

---

## 변경된 파일 목록 (Phase 3)

| 파일 | 변경 내용 |
|------|----------|
| `netlify/functions/news-proxy.ts` | **삭제** |
| `src/lib/api.ts` | `fetchTrendingNews`, `searchNews` 제거 |
| `src/lib/articles.ts` | admin client 사용 + anon fallback + 에러 로깅 |
| `src/app/page.tsx` | trending 비면 latest로 fallback |
| `src/app/world/page.tsx` | Supabase API route로 전환 |
| `src/app/search/page.tsx` | Supabase API route로 전환 |
| `src/components/CategoryPage.tsx` | searchNews fallback 제거 |
| `src/app/topic/[keyword]/page.tsx` | SEO 강화 + 관련 토픽 |
| `src/app/api/articles/route.ts` | **신규** - 클라이언트용 API + debug |
