# JubJub News 구현 보고서

**프로젝트:** JubJub 뉴스 (headlines.fazr.co.kr)
**스택:** Next.js 16.1.6 + Supabase + Netlify + Tailwind CSS
**브랜치:** `claude/fix-deployment-ads-Gc2IO`

---

## 이번 세션에서 구현한 것

### 1. `/ai` 페이지 (AI 뉴스 요약 페이지) — 신규 생성

- **`src/app/ai/page.tsx`** — SSR 서버 컴포넌트
  - Supabase에서 `summary`가 있는 기사만 필터링하여 최신 30개 표시
  - 인기 키워드 15개를 태그 클라우드로 표시 (클릭 시 `/topic/[keyword]`로 이동)
  - SEO 메타데이터 (title, description, canonical URL)
  - 광고 슬롯 (top-ai, bottom-ai)

- **`src/app/ai/AiArticleList.tsx`** — 클라이언트 컴포넌트
  - 가로형 카드 레이아웃 (이미지 + 요약 텍스트)
  - "AI 요약" 배지 표시
  - 북마크 버튼 연동
  - 키워드 태그 (최대 3개)
  - 기사 없을 때 안내 메시지

### 2. `src/lib/articles.ts` — 쿼리 추가

- `getArticlesWithSummary(limit)` 함수 추가
  - `summary IS NOT NULL AND summary != ''` 조건으로 필터
  - `created_at DESC` 정렬

### 3. `src/components/Header.tsx` — 네비게이션 업데이트

- **상단 바:** "AI 뉴스" 링크 추가 (Sparkles 아이콘)
- **데스크톱 네비게이션:** "AI" 버튼 추가 (primary 색상 강조)
- **모바일 햄버거 메뉴:** "AI 뉴스" 항목 추가

---

## 기존에 이미 구현되어 있던 것 (이전 세션)

| 기능 | 상태 | 파일 |
|------|------|------|
| Supabase 클라이언트 설정 | ✅ 완료 | `src/lib/supabase.ts` |
| DB 타입 정의 | ✅ 완료 | `src/types/database.ts` |
| 기사 쿼리 함수 | ✅ 완료 | `src/lib/articles.ts` |
| `/news/[slug]` 개별 기사 페이지 | ✅ 완료 | `src/app/news/[slug]/page.tsx` |
| `/topic/[keyword]` 토픽 페이지 | ✅ 완료 | `src/app/topic/[keyword]/page.tsx` |
| `news-ingest` CRON 함수 | ✅ 완료 | `netlify/functions/news-ingest.ts` |
| Claude Haiku AI 요약 생성 | ✅ 완료 | CRON 내 `generateSummary()` |
| 키워드 자동 추출 | ✅ 완료 | CRON 내 `extractKeywords()` |
| source_hash 중복 방지 | ✅ 완료 | CRON 내 upsert |
| slug 자동 생성 | ✅ 완료 | CRON 내 `generateSlug()` |

---

## 아직 안 된 것 (TODO)

| 항목 | 우선순위 | 설명 |
|------|----------|------|
| 홈페이지 DB 전환 | 높음 | 현재 RapidAPI 프록시 사용 중 → Supabase 쿼리로 전환 필요 |
| 카테고리 페이지 DB 전환 | 높음 | 현재 `searchNews()` 프록시 사용 → `getArticlesByCategory()`로 전환 |
| sitemap.xml 생성 | 중간 | SEO 필수, `/news/[slug]` 전체 URL 포함 |
| news-ingest 첫 실행 타임아웃 | 낮음 | 80개 기사 × 순차 AI 호출 ≈ 96초 (Netlify 10초 제한 초과 가능). 평상시에는 신규 기사만 처리하므로 문제없을 수 있음 |
| Supabase RLS 정책 확인 | 낮음 | 대시보드에서 수동 확인 필요 |
| API 프록시 제거 | 마지막 | 홈페이지/카테고리 전환 완료 후 |

---

## 데이터 흐름 (현재)

### Supabase 기반 경로 (신규)

```
news-ingest CRON (4시간마다)
  → RapidAPI에서 기사 수집
  → Claude Haiku로 AI 요약 생성
  → Supabase DB 저장
  → /news/[slug], /topic/[keyword], /ai 페이지에서 조회
```

### API 프록시 경로 (기존, 아직 전환 안 됨)

```
홈페이지, 카테고리 페이지
  → /.netlify/functions/news-proxy
  → RapidAPI 직접 호출
  → 브라우저 렌더링
```

---

## 환경 변수 필요 목록

| 변수 | 용도 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (읽기) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (쓰기) |
| `ANTHROPIC_API_KEY` | Claude Haiku AI 요약용 |
| `RAPIDAPI_KEY` | 뉴스 API 호출용 |
| `INGEST_SECRET` | news-ingest 수동 트리거 인증용 |

---

## 빌드 상태

- ✅ `next build` 성공
- ✅ TypeScript 에러 없음
- ✅ 브랜치에 푸시 완료

---

## 참고

`/ai` 페이지에 "AI 요약 기사가 아직 없습니다"가 뜨는 건 **정상**입니다.
`news-ingest` CRON이 실행되어 Supabase에 기사가 쌓이면 자동으로 표시됩니다.

수동 테스트: `https://도메인/.netlify/functions/news-ingest?secret=INGEST_SECRET` 호출
