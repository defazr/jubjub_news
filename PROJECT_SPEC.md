# JubJub 뉴스 - 프로젝트 스펙 및 작업 이력

> GPT 등 외부 AI에게 프로젝트 컨텍스트를 전달하기 위한 문서입니다.

---

## 1. 프로젝트 개요

- **이름:** JubJub 뉴스 (줍줍뉴스)
- **URL:** https://headlines.fazr.co.kr
- **설명:** 국내외 정치, 경제, 사회, 국제, IT/과학, 스포츠 등 주요 뉴스를 실시간으로 한눈에 모아보는 뉴스 큐레이션 서비스
- **언어:** 한국어 (ko_KR), 영어 번역 기능 포함

---

## 2. 기술 스택

| 분야 | 기술 | 버전 |
|------|------|------|
| 프레임워크 | Next.js (App Router) | 16.1.6 |
| 언어 | TypeScript | 5 |
| UI | React | 19.2.3 |
| 스타일링 | Tailwind CSS | 4 |
| UI 컴포넌트 | shadcn/ui + Radix UI | - |
| 아이콘 | lucide-react | 0.577.0 |
| 테마 | next-themes | 0.4.6 |
| **배포** | **Netlify** (정적 빌드 + Netlify Functions) | - |
| 광고 | Google AdSense | ca-pub-7976139023602789 |
| PWA | Service Worker + Manifest | - |

---

## 3. 빌드 & 배포 구성

### next.config.ts
```typescript
const nextConfig: NextConfig = {
  output: "export",              // 완전 정적 빌드 (SSG)
  images: { unoptimized: true }  // 정적 빌드용 이미지 최적화 비활성화
};
```

### netlify.toml
- Node.js v20
- 빌드 명령: `npm run build`
- 배포 폴더: `out` (Next.js static export)
- 서버리스 함수: `netlify/functions/`
- 보안 헤더 (X-Frame-Options, CSP 등) 설정 완료
- 정적 자산 1년 캐시

### 중요 제약사항
- `output: "export"` 모드이므로 **SSR/ISR 불가** (현재)
- 모든 데이터는 **클라이언트 사이드**에서 API 호출로 로딩
- Google 봇이 방문 시 **빈 HTML**만 보게 됨 → SEO 문제의 근본 원인

---

## 4. 페이지 라우트 구조

| URL | 파일 | 설명 |
|-----|------|------|
| `/` | `src/app/page.tsx` | 홈 - 트렌딩 뉴스 + 8개 카테고리 |
| `/category/politics` | `src/app/category/politics/page.tsx` | 정치 카테고리 |
| `/category/economy` | `src/app/category/economy/page.tsx` | 경제 카테고리 |
| `/category/society` | `src/app/category/society/page.tsx` | 사회 카테고리 |
| `/category/world` | `src/app/category/world/page.tsx` | 국제 카테고리 |
| `/category/culture` | `src/app/category/culture/page.tsx` | 문화 카테고리 |
| `/category/tech` | `src/app/category/tech/page.tsx` | IT/과학 카테고리 |
| `/category/sports` | `src/app/category/sports/page.tsx` | 스포츠 카테고리 |
| `/category/opinion` | `src/app/category/opinion/page.tsx` | 오피니언 카테고리 |
| `/article` | `src/app/article/page.tsx` | 외부 기사 리다이렉트 (7초 카운트다운 + 광고) |
| `/world` | `src/app/world/page.tsx` | 해외 뉴스 (영어 뉴스) |
| `/bookmarks` | `src/app/bookmarks/page.tsx` | 스크랩한 기사 목록 |
| `/search` | `src/app/search/page.tsx` | 검색 결과 |

총 **13개 페이지** (매우 적음)

---

## 5. 컴포넌트 구조

### 레이아웃
- `Header.tsx` - 로고, 검색바, 메뉴, 다크모드 토글, 글자크기 조절
- `Footer.tsx` - 카테고리 링크, 고객센터
- `Sidebar.tsx` - "많이 본 뉴스" 랭킹 (상위 8개)

### 콘텐츠
- `HeadlineSection.tsx` - 메인 헤드라인 (대형 기사 + 서브 기사 + 주요뉴스 리스트)
- `CategorySection.tsx` - 8개 카테고리 그리드/리스트 전환
- `CategoryPage.tsx` - 카테고리 상세 페이지 공통 (무한 스크롤)
- `BreakingNewsTicker.tsx` - 속보 마키 애니메이션

### 인터랙션
- `BookmarkButton.tsx` - 북마크 토글
- `ShareButton.tsx` - 공유 (카카오톡, 트위터 등)
- `TranslateButton.tsx` - 한영 번역 토글
- `ScrollToTop.tsx` - 맨 위로 버튼
- `ReadingProgress.tsx` - 읽기 진행률 바
- `AdUnit.tsx` - Google AdSense 광고 컴포넌트

### UI 기반 (shadcn/ui)
- Button, Card, Badge, Skeleton, Separator, Sheet, ScrollArea

---

## 6. 데이터 흐름

### 뉴스 API
```
클라이언트 (브라우저)
  → /.netlify/functions/news-proxy (Netlify Function)
    → 외부 뉴스 API (GNews)
```
- `fetchTrendingNews()` - 트렌딩 뉴스 조회
- `searchNews(query)` - 키워드 검색
- 클라이언트 캐시: 5분 TTL (메모리) + 3시간 TTL (localStorage)

### 번역 API
```
클라이언트
  → /.netlify/functions/translate-proxy (Netlify Function)
    → 외부 번역 API
```
- `translateTexts(texts, targetLang)` - 텍스트 배열 번역
- 번역 캐시: 1시간 (메모리) + 2시간 (localStorage)

### 클라이언트 저장소 (localStorage)
- 북마크 (`jubjub_bookmarks`)
- 읽은 기사 (`jubjub_read_urls`, 최대 500개)
- 검색 이력 (`jubjub_search_history`, 최대 10개)
- 글자 크기 (`jubjub_font_size`, 12~22px)
- 레이아웃 (`jubjub_layout`, grid/list)
- 뉴스 캐시 (`jubjub_news_cache`, 3시간 TTL)

---

## 7. 카테고리 정보

| 이름 | slug | 검색 쿼리 | 색상 |
|------|------|----------|------|
| 정치 | politics | 한국 정치 국회 | #DC2626 |
| 경제 | economy | 한국 경제 금융 | #2563EB |
| 사회 | society | 한국 사회 사건 | #7C3AED |
| 국제 | world | 국제 세계 외교 | #059669 |
| 문화 | culture | 한국 문화 예술 연예 | #D97706 |
| IT/과학 | tech | IT 기술 과학 AI | #0891B2 |
| 스포츠 | sports | 스포츠 축구 야구 | #E11D48 |
| 오피니언 | opinion | 사설 칼럼 오피니언 | #6D28D9 |

---

## 8. 디자인 시스템 (현재 적용됨)

### 컬러 팔레트 (News/Media)
- **Primary (Breaking Red):** `#DC2626` (라이트) / `#EF4444` (다크)
- **CTA (Link Blue):** `#1E40AF` (라이트) / `#60A5FA` (다크)
- **배경:** `#FAFAFA` (라이트) / `#0F0F0F` (다크)
- **카드:** `#FFFFFF` (라이트) / `#1A1A1A` (다크)

### 타이포그래피
- **본문:** Noto Sans KR (Google Fonts)
- **헤드라인:** Newsreader (Google Fonts, 세리프 에디토리얼 스타일)
- **기본 글씨 크기:** 17px
- **letter-spacing:** -0.01em (본문), -0.02em (헤드라인)

### 글씨 크기 매핑
| 요소 | 크기 |
|------|------|
| 메인 헤드라인 | text-2xl ~ text-3xl |
| 서브 헤드라인 | text-lg ~ text-xl |
| 카테고리 제목 | text-lg |
| 카테고리 기사 제목 | text-base (피처드) / text-[15px] (리스트) |
| 본문/요약 | text-sm ~ text-base |
| 메타 정보 | text-sm |

---

## 9. 최근 작업 이력

### 2026-03-10: 디자인 오버홀
- 컬러 팔레트: oklch 기반 → News/Media HEX 팔레트 (#DC2626 + #1E40AF)
- 폰트: Pretendard → Noto Sans KR + Newsreader (Google Fonts CDN)
- 기본 글씨 크기: 16px → 17px
- 전체 텍스트 사이즈 한 단계씩 업 (text-xs → text-sm, text-sm → text-base 등)
- 다크모드 컬러 개선
- 적용 파일: globals.css, layout.tsx, Header.tsx, Footer.tsx, Sidebar.tsx, HeadlineSection.tsx, CategorySection.tsx, article/page.tsx

---

## 10. 현재 SEO 문제

Google Search Console에서 카테고리 페이지들이 **"적절한 표준 태그가 포함된 대체 페이지"**로 분류되어 색인 생성 안 됨.

**근본 원인:**
1. `output: "export"` (SSG) + `"use client"` → Google 봇에게 빈 HTML
2. 카테고리 페이지가 메인과 구조적으로 거의 동일 → 중복 판정
3. 고유 콘텐츠 부재 (외부 링크만 큐레이션)
4. 전체 페이지 수가 13개로 매우 적음

**개선 방향:** → `SEO_IMPROVEMENT_PLAN.md` 참조

---

## 11. 폴더 구조

```
jubjub_news/
├── src/
│   ├── app/
│   │   ├── globals.css          # 전역 스타일 + 컬러 테마
│   │   ├── layout.tsx           # 루트 레이아웃 (메타데이터, Google Fonts)
│   │   ├── page.tsx             # 홈 페이지
│   │   ├── article/page.tsx     # 기사 리다이렉트
│   │   ├── bookmarks/page.tsx   # 스크랩
│   │   ├── search/page.tsx      # 검색
│   │   ├── world/page.tsx       # 해외 뉴스
│   │   └── category/
│   │       ├── politics/page.tsx
│   │       ├── economy/page.tsx
│   │       ├── society/page.tsx
│   │       ├── world/page.tsx
│   │       ├── culture/page.tsx
│   │       ├── tech/page.tsx
│   │       ├── sports/page.tsx
│   │       └── opinion/page.tsx
│   ├── components/
│   │   ├── Header.tsx, Footer.tsx, Sidebar.tsx
│   │   ├── HeadlineSection.tsx, CategorySection.tsx, CategoryPage.tsx
│   │   ├── BreakingNewsTicker.tsx, Logo.tsx
│   │   ├── BookmarkButton.tsx, ShareButton.tsx, TranslateButton.tsx
│   │   ├── AdUnit.tsx, ScrollToTop.tsx, ReadingProgress.tsx
│   │   ├── ThemeProvider.tsx
│   │   └── ui/ (shadcn: button, card, badge, skeleton, separator, sheet, scroll-area)
│   └── lib/
│       ├── api.ts               # 뉴스 API + 번역 API
│       ├── categories.ts        # 8개 카테고리 정의
│       ├── link.ts              # 기사 링크 생성
│       ├── storage.ts           # localStorage 관리
│       └── utils.ts             # cn() 유틸리티
├── netlify/
│   └── functions/
│       ├── news-proxy.ts        # 뉴스 API 프록시
│       └── translate-proxy.ts   # 번역 API 프록시
├── public/
│   ├── favicon.png, logo.png, og-image.jpg
│   ├── manifest.json, sw.js
│   ├── robots.txt, sitemap.xml
│   └── icons/
├── netlify.toml                 # Netlify 배포 설정
├── next.config.ts               # Next.js 설정 (output: "export")
├── package.json
├── tsconfig.json
└── SEO_IMPROVEMENT_PLAN.md      # SEO 개선 계획서
```
