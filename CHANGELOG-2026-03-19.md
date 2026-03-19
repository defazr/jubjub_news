# Headlines Fazr - 작업 내역 (2026-03-19)

## 1. /category → /topic 구조 통일

### 배경
- `/category/ai` 페이지를 별도 생성하여 404를 해결했으나, `/topic/ai`와 중복 발생
- SEO authority 분산 + Discover 클러스터 혼란 우려
- `/topic/[keyword]` 단일 구조로 통일 필요

### 변경 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/components/Header.tsx` | `/category/${slug}` → `/topic/${slug}` (2곳) |
| `src/components/Footer.tsx` | `/category/${slug}` → `/topic/${slug}` |
| `src/components/FullMenu.tsx` | `/category/${slug}` → `/topic/${slug}` |
| `src/components/CategoryPage.tsx` | `/category/${slug}` → `/topic/${slug}` |
| `src/app/digest/page.tsx` | `/category/${slug}` → `/topic/${slug}` |
| `src/app/sitemap-news.xml/route.ts` | sitemap 내 `/category/*` → `/topic/*` + `/topic/ai` 추가 |
| `src/app/category/ai/page.tsx` | **삭제** |
| `next.config.ts` | 301 리다이렉트 추가: `/category/:slug` → `/topic/:slug` |

### 리다이렉트 설정 (next.config.ts)

```typescript
async redirects() {
  return [
    {
      source: "/category/:slug",
      destination: "/topic/:slug",
      permanent: true, // 301
    },
  ];
},
```

### 효과
- 사이트 전체 `/topic/` 단일 authority 구조
- 기존 `/category/` URL 접속 시 자동 301 리다이렉트
- Google 색인, 외부 링크, 북마크 모두 안전하게 처리
- Discover 클러스터 일관성 확보

---

## 2. DB 연결 수정 + 디버그 로깅

### 배경
- `/api/news-status` 에서 `articles_total = 0` 반환 의심
- GitHub Actions ingest 502 에러 보고
- 원인 조사 필요

### 발견된 문제

**`news-ingest`와 `backfill-summaries`에서 잘못된 키 사용:**

```typescript
// 수정 전 (잘못됨)
const SUPABASE_SERVICE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// 수정 후 (올바름)
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";
```

- 변수명은 `SUPABASE_SERVICE_KEY`이지만 실제로 anon key를 읽고 있었음
- `SUPABASE_SERVICE_ROLE_KEY` 우선 사용하도록 수정 (fallback으로 anon key 유지)

### 변경 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/app/api/news-ingest/route.ts` | 서비스 키 수정 + `[INGEST]` env 체크 로그 추가 |
| `src/app/api/backfill-summaries/route.ts` | 서비스 키 수정 |
| `src/app/api/news-status/route.ts` | `env_check` 응답 필드 추가 + `force-dynamic` + 에러 로깅 |

### news-status 응답에 추가된 필드

```json
{
  "env_check": {
    "SUPABASE_URL": true,
    "SUPABASE_ANON_KEY": true,
    "SUPABASE_SERVICE_ROLE_KEY": false,
    "INGEST_SECRET": true,
    "RAPIDAPI_KEY": true,
    "ANTHROPIC_API_KEY": true
  }
}
```

### 진단 결과 (배포 후 확인)

```json
{
  "articles_total": 1062,
  "articles_last_24h": 61,
  "latest_article_time": "2026-03-19T18:53:17.79118+00:00",
  "SUPABASE_SERVICE_ROLE_KEY": false
}
```

- DB 연결: **정상** (1062개 기사 확인)
- 데이터 수집: **정상** (24시간 내 61개)
- `SUPABASE_SERVICE_ROLE_KEY`: **Netlify 환경변수에 미설정**

### 남은 조치

Netlify Dashboard → Environment variables에 `SUPABASE_SERVICE_ROLE_KEY` 추가 필요
(Supabase Dashboard → Settings → API → service_role key 값)

---

## 커밋 이력

| 커밋 | 내용 |
|------|------|
| `0019aae` | /category → /topic 구조 통일 + 301 리다이렉트 |
| `497dd73` | DB 서비스 키 수정 + 디버그 로깅 추가 |

## 수정하지 않은 것

- 라우팅 구조 (topic/article 페이지)
- SEO 메타, JSON-LD
- 뉴스 ingest 로직
- DB 스키마
- 광고 슬롯
- UI 레이아웃
