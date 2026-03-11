# Headlines Fazr - 작업 이력 (2026-03-11)

## 세션 요약

이 문서는 Claude 세션 간 컨텍스트 유지를 위한 작업 기록입니다.

---

## 1. 푸터 페이지 정리

**커밋**: `db3291c` - Add legal pages and clean up footer

### 변경 내용
- Footer에서 "Support", "Submit a tip" 링크 제거
- 3개만 유지: **Advertise**, **Privacy Policy**, **Terms of Service**
- `href="#"` → 실제 페이지 링크로 변경

### 새 파일
| 파일 | 내용 |
|------|------|
| `src/app/privacy/page.tsx` | Privacy Policy (AdSense/Analytics 명시) |
| `src/app/terms/page.tsx` | Terms of Service (AI 요약 면책) |
| `src/app/advertise/page.tsx` | 광고 문의 페이지 |

---

## 2. Bloomberg 스타일 Header 재설계

**커밋**: `698218c` → `7e96fd1` (2단계)

### Before → After
```
Before (3단, 답답):
[날짜 | Saved | AI News | Trending | A↓ A↑]
[      Headlines Fazr (큰 로고)      ]
[☰                     🔍 🔖 🌙]

After (Bloomberg 스타일):
[Headlines Fazr              🔍 ☰]   ← Top Header (56px)
[☀️ 12° Seoul | USD/KRW 1,342 ▲0.2% | BTC $67K ▼1.3%]  ← InfoBar (32px)
[🔥 Trending  AI · Nvidia · Tesla · OpenAI]  ← TrendingBar (32px)
```

### 새 컴포넌트
| 파일 | 역할 |
|------|------|
| `src/components/InfoBar.tsx` | 날씨(Open-Meteo) + USD/KRW(er-api) + BTC(CoinGecko), 10분 캐시 |
| `src/components/TrendingBar.tsx` | 트렌딩 키워드 가로 스크롤, /api/trending-keywords 호출 |
| `src/components/FullMenu.tsx` | Bloomberg 스타일 전체화면 메뉴 |

### 새 API
| 파일 | 역할 |
|------|------|
| `src/app/api/trending-keywords/route.ts` | DB 인기 키워드 API (ISR 10분) |

### Header 핵심 포인트
- **헤더 아이콘**: Search + Menu 2개만 (Bloomberg/Reuters 스타일)
- **Bookmark, Theme toggle**: FullMenu 안 Settings 섹션으로 이동
- **InfoBar 변동률**: ▲ 초록(emerald) / ▼ 빨강(red) 색상
- **TrendingBar**: "Trending" 라벨 항상 표시
- **FullMenu 순서**: Home → Trending → AI → World → Daily Digest → Sections → Settings
- **overscroll-behavior: contain**: iOS 바운스 스크롤 방지
- **Body scroll lock**: 메뉴 열림시 `document.body.style.overflow = "hidden"`
- **스크롤시**: 컴팩트 sticky bar (로고 + 카테고리 + 🔍 ☰)

---

## 3. 뉴스 사이트 품질 강화

**커밋**: `7f8cc40` - Add news quality features

### #1 Vercel Cron 자동 수집
- `vercel.json` 생성: 매시간 `/api/news-ingest?summarize=true` 실행
- `cron: "0 * * * *"`

### #3 Breaking News 알고리즘
- `getBreakingArticles()` 함수 추가 (articles.ts)
- 조건: 최근 6시간 + AI summary 존재
- Fallback: 부족하면 최신 summarized 기사로 대체
- Homepage에 breaking prop으로 전달

### #4 Related Articles 키워드 기반
- `getRelatedArticles()` 개선
- 30개 후보 fetch → 키워드 overlap 점수로 정렬
- 카테고리 필터 유지 + 키워드 매칭 추가

### #5 Topic Page 동적 설명
- 기사에서 co-occurring 키워드 자동 추출
- "Related: keyword1 · keyword2 · ..." 표시
- SEO content 강화

### #6 Daily Digest 페이지
- **URL**: `/digest`
- **ISR**: 1시간
- 카테고리별 top 3 기사 (Tech, Economy, World, AI, Science, Sports)
- `getDigestArticles()` 함수 추가
- FullMenu에 Daily Digest 링크 추가

### #7 Article Freshness 배지
- `timeAgo()` → `{ text, isRecent }` 반환
- 6시간 이내: **초록 배지** `bg-emerald-500/10`
- 그 이후: 회색 텍스트
- Google Discover freshness 신호

---

## 현재 파일 구조 (핵심)

```
src/
├── app/
│   ├── page.tsx                    # 홈페이지 (ISR 5분)
│   ├── HomeContent.tsx             # 홈 클라이언트 컴포넌트
│   ├── digest/page.tsx             # Daily Digest (ISR 1시간) ✨ NEW
│   ├── privacy/page.tsx            # Privacy Policy ✨ NEW
│   ├── terms/page.tsx              # Terms of Service ✨ NEW
│   ├── advertise/page.tsx          # Advertise ✨ NEW
│   ├── ai/                         # AI 요약 뉴스
│   ├── news/[slug]/                # 기사 페이지
│   │   ├── page.tsx
│   │   └── ArticleContent.tsx      # Freshness 배지 포함
│   ├── topic/[keyword]/            # 토픽 페이지 (동적 설명)
│   ├── search/                     # 검색
│   ├── trending/                   # 트렌딩
│   └── api/
│       ├── news-ingest/            # 뉴스 수집
│       ├── trending-keywords/      # 트렌딩 키워드 API ✨ NEW
│       └── backfill-summaries/     # AI 요약 백필
├── components/
│   ├── Header.tsx                  # Bloomberg 스타일 헤더
│   ├── InfoBar.tsx                 # 날씨/환율/BTC ✨ NEW
│   ├── TrendingBar.tsx             # 트렌딩 키워드바 ✨ NEW
│   ├── FullMenu.tsx                # 전체화면 메뉴 ✨ NEW
│   ├── Footer.tsx                  # 정리된 푸터
│   └── AdUnit.tsx                  # AdSense
├── lib/
│   ├── articles.ts                 # DB 쿼리 (Breaking, Digest, Related 추가)
│   ├── categories.ts               # 카테고리 매핑
│   └── storage.ts                  # localStorage 유틸
└── types/
    └── database.ts                 # Article 타입

vercel.json                         # Cron 설정 ✨ NEW
```

---

## 현재 시스템 상태

| 영역 | 상태 | 비고 |
|------|------|------|
| 뉴스 수집 | ✅ 자동 (1시간) | vercel.json cron |
| AI 요약 | ✅ 자동 | ingest 시 summarize=true |
| Header UI | ✅ Bloomberg 스타일 | 2단 컴팩트 |
| InfoBar | ✅ 날씨/환율/BTC | 10분 캐시 |
| TrendingBar | ✅ 키워드 스크롤 | API + fallback |
| FullMenu | ✅ 전체화면 | body scroll lock |
| Breaking News | ✅ 6시간 알고리즘 | fallback 포함 |
| Related Articles | ✅ 키워드 overlap | 30 후보 → 점수 정렬 |
| Daily Digest | ✅ /digest | ISR 1시간 |
| Freshness 배지 | ✅ 초록/회색 | 6시간 기준 |
| Topic SEO | ✅ 동적 설명 | co-occurring 키워드 |
| 푸터 | ✅ 3개 링크 | Privacy/Terms/Advertise |
| SEO | ✅ 완료 | sitemap, robots, JSON-LD, og |
| 광고 | ✅ AdSense | top/mid/bottom 슬롯 |

---

## 다음 단계 (미완료)

1. Google News 정식 신청
2. Topic 페이지 트래픽 확장 (Google Discover + Google News)
3. 자동 키워드 생성 확장
4. 뉴스 사이트 UI 8가지 핵심 요소 (추가 예정)

---

## 기술 스택

- **Framework**: Next.js (App Router, ISR)
- **DB**: Supabase (RLS, anon client)
- **AI**: Claude Haiku (요약)
- **뉴스 소스**: RapidAPI
- **호스팅**: Vercel
- **광고**: Google AdSense
- **CSS**: Tailwind CSS + shadcn/ui
- **외부 API**: Open-Meteo(날씨), er-api(환율), CoinGecko(BTC)

---

*마지막 업데이트: 2026-03-11 세션*
*브랜치: claude/review-markdown-files-Pawh5*
