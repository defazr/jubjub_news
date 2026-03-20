# Headlines Fazr - GPT 핸드오프 보고서

> 작성일: 2026-03-20
> 작성자: Claude (AI assistant)
> 목적: GPT가 이 프로젝트를 이어서 작업할 수 있도록 현재 상태를 정리

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 프로젝트명 | Headlines Fazr (jubjub_news) |
| 사이트 URL | https://headlines.fazr.co.kr |
| GitHub | defazr/jubjub_news |
| 호스팅 | **Netlify** (Vercel 아님) |
| 프레임워크 | Next.js 16.1.6 + React 19.2.3 |
| DB | Supabase (PostgreSQL) |
| 언어 | TypeScript |
| 상태 | **운영 단계 (개발 종료)** |

### 한 줄 요약

영문 뉴스를 RapidAPI로 수집 → Claude AI로 요약 → Supabase에 저장 → Next.js ISR로 서비스하는 뉴스 사이트.

---

## 2. 아키텍처

```
[RapidAPI News] → /api/news-ingest → [Claude Haiku AI 요약] → [Supabase DB] → [Next.js ISR] → [Netlify CDN]
```

- **수집**: GitHub Actions Cron이 1시간마다 `/api/news-ingest?summarize=true` 호출
- **요약**: Anthropic Claude Haiku가 기사 요약 생성
- **저장**: Supabase `articles` 테이블에 insert (중복 필터링 포함)
- **서비스**: Next.js ISR + Netlify CDN

---

## 3. 환경변수 (Netlify에 설정됨)

| 변수 | 용도 | 상태 (2026-03-20) |
|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 공개 키 (읽기용) | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 관리자 키 (쓰기용, RLS 우회) | ✅ |
| `INGEST_SECRET` | 뉴스 수집 API 인증 시크릿 | ✅ |
| `RAPIDAPI_KEY` | RapidAPI 뉴스 API 키 | ✅ |
| `ANTHROPIC_API_KEY` | Claude AI 요약용 API 키 | ✅ |

### Supabase 프로젝트

- **프로젝트 ID**: `wzxayrmkykzxmujejyzg`
- **URL**: `https://wzxayrmkykzxmujejyzg.supabase.co`
- 프로젝트 1개만 운영 중 (2026-03-20 정리 완료)

---

## 4. 실시간 상태 (2026-03-20 확인)

```json
{
  "articles_total": 1077,
  "articles_last_24h": 67,
  "articles_last_hour": 3,
  "pipeline": { "ingest_ok": true }
}
```

- 일일 기사 생산량: 약 60~100개
- 정상 패턴: inserted 20~40, duplicates 100+, errors 0

---

## 5. 디렉토리 구조

### 페이지 라우트 (`src/app/`)

```
/                          → 홈페이지 (page.tsx + HomeContent.tsx)
/ai                        → AI 요약 뉴스 리스트
/news/[slug]               → 개별 기사 페이지
/topic/[keyword]           → 토픽별 기사 모음
/category/[slug]           → 카테고리 페이지
/search                    → 검색
/digest                    → 다이제스트
/trending                  → 트렌딩
/bookmarks                 → 북마크
/world                     → 월드 뉴스
/privacy, /terms, /advertise → 정적 페이지
```

### API 라우트 (`src/app/api/`)

| API | 역할 |
|-----|------|
| `/api/news-ingest` | 뉴스 수집 + AI 요약 + DB 저장 (cron 대상) |
| `/api/news-status` | 운영 상태 모니터링 (환경변수 체크 포함) |
| `/api/backfill-summaries` | 요약 없는 기사에 AI 요약 일괄 생성 |
| `/api/articles` | 기사 조회 API |
| `/api/translate` | 번역 API |
| `/api/trending-keywords` | 트렌딩 키워드 API |
| `/api/og-image` | OG 이미지 동적 생성 |

### 핵심 라이브러리 (`src/lib/`)

| 파일 | 역할 |
|------|------|
| `articles.ts` | DB 쿼리 함수 (getArticlesByKeyword, getPopularKeywords 등) |
| `supabase.ts` | Supabase 클라이언트 (public + admin) |
| `categories.ts` | 카테고리 매핑 |

### 주요 컴포넌트 (`src/components/`)

| 컴포넌트 | 역할 |
|----------|------|
| `SafeImage.tsx` | 이미지 로딩 + sanitize URL + fallback |
| `InfoBar.tsx` | 날씨/환율/BTC (hydration guard 적용) |
| `AdUnit.tsx` | AdSense 광고 (슬롯별 매핑) |
| `Header.tsx` | 헤더 |
| `TrendingBar.tsx` | 트렌딩 키워드 바 |
| `BreakingNewsTicker.tsx` | 속보 티커 |
| `Footer.tsx` | 푸터 |

---

## 6. Supabase DB 구조

### `articles` 테이블 (주요 컬럼)

- `id` - UUID PK
- `title` - 기사 제목
- `slug` - URL 슬러그
- `summary` - AI 생성 요약
- `content` - 기사 본문
- `image_url` - 대표 이미지
- `source` - 출처
- `keywords` - 키워드 배열 (text[])
- `category` - 카테고리
- `created_at` - 생성 시각
- `published_at` - 발행 시각

> DB schema 변경 금지

---

## 7. 수정 금지 사항

### 절대 수정 금지 파일
- `src/lib/articles.ts`
- `src/app/api/news-ingest/route.ts`
- Supabase schema

### 수정 금지 로직
- React Hydration guard (`InfoBar.tsx`)
- 이미지 sanitize + fallback (`SafeImage.tsx`)
- 캐시 정책 (homepage 60s, topic 300s, article 3600s, digest 3600s)
- 뉴스 ingest 파이프라인 구조

### 변경 금지 원칙
1. 아키텍처 변경 금지 (RapidAPI → ingest → Supabase → Next.js)
2. UI 변경 최소화
3. API 구조 변경 금지
4. DB schema 변경 금지
5. URL 구조 변경 금지
6. 내부링크 구조 변경 금지

---

## 8. 이미 해결된 문제 (재발 시 참고)

| 문제 | 원인 | 해결 | 파일 |
|------|------|------|------|
| React Hydration #418 | InfoBar client/server mismatch | mounted guard + skeleton | `InfoBar.tsx` |
| CDN 이미지 422 | contentstack resize 파라미터 미지원 | `sanitizeImageUrl()` query 제거 | `SafeImage.tsx` |
| Image fallback | 외부 이미지 로드 실패 | naturalWidth 체크 + onError fallback | `SafeImage.tsx` |
| /category/ai 404 | CATEGORIES에 AI 미포함 | categories.ts + page.tsx 추가 | `categories.ts` |
| GitHub Actions Cron 실패 | Secrets 미설정 | GitHub Secrets 등록 | `.github/workflows/` |

---

## 9. 광고 (AdSense)

| 슬롯 | AdSense ID |
|------|-----------|
| top-article | 9121339058 |
| mid-article | 2248808942 |
| bottom-article | 9121339058 |
| top-ai / top-home / top-topic | 9121339058 |
| mid-ai / bottom-ai | 2248808942 |
| bottom-home / bottom-topic | 2248808942 |

- header 아래 광고 금지

---

## 10. SEO / Discover 준비 상태

| 항목 | 상태 |
|------|------|
| JSON-LD (NewsArticle) | ✅ |
| og:image 1200px+ | ✅ |
| sitemap.xml | ✅ |
| sitemap-news.xml | ✅ |
| sitemap-topics.xml | ✅ |
| RSS (rss.xml) | ✅ |
| robots.txt | ✅ |
| 검색엔진 등록 | Google, Naver, Bing ✅ |
| Topic pages | ✅ |
| Digest | ✅ |
| Breaking news | ✅ |
| Trending | ✅ |

---

## 11. 배포 방법

1. GitHub에 push
2. Netlify가 자동 배포 (Git deploy)
3. 수동 배포: Netlify 대시보드 → Deploys → **"Clear cache and deploy site"**

---

## 12. 운영 명령어

### 상태 확인
```
GET https://headlines.fazr.co.kr/api/news-status
```

### 수동 뉴스 수집
```
GET https://headlines.fazr.co.kr/api/news-ingest?secret=INGEST_SECRET&summarize=true
```

### AI 요약 백필
```
GET https://headlines.fazr.co.kr/api/backfill-summaries?secret=INGEST_SECRET&limit=50
```

---

## 13. 현재 단계 및 다음 작업

### 현재: 운영 + 관찰 단계
- 기사 1,077개 축적 완료
- 자동 수집/요약/중복제거 정상 동작 중
- Google Discover 반응 대기 중

### 추후 작업 (지금은 진행하지 않음)
1. Discover 카드 개선
2. Topic cluster 확장
3. Digest 확장
4. Google News 정식 신청

---

## 14. 운영 로그

### 2026-03-20
- Supabase 프로젝트 정리 (불필요 프로젝트 삭제, `wzxayrmkykzxmujejyzg`만 유지)
- `SUPABASE_SERVICE_ROLE_KEY` Netlify 환경변수에 등록
- 재배포 후 전체 환경변수 정상 확인

### 2026-03-19
- `/category/ai` 404 수정 완료

### 2026-03-14
- GitHub Actions Cron 복구 완료

---

> 이 문서는 GPT가 프로젝트를 이어서 작업할 수 있도록 작성된 핸드오프 보고서입니다.
> 코드 수정 시 반드시 "수정 금지 사항" 섹션을 먼저 확인하세요.
