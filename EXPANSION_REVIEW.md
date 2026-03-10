# JubJub 뉴스 확장 설계 - Claude 검토 결과

> 설계 지시서 v1에 대한 기술적 검토 의견입니다.
> 이 문서를 기반으로 최종 SSOT 지시서를 작성합니다.

---

## 검토 결과

### 1. Netlify + ISR: 가장 큰 기술적 장벽

현재 `next.config.ts`에 `output: "export"`가 설정되어 있습니다. 이건 **완전 정적 빌드**입니다.

**문제:** Netlify에서 Next.js ISR(`revalidate`)을 쓰려면 `output: "export"`를 **제거**하고 `@netlify/plugin-nextjs`를 사용해야 합니다. 이건 단순 설정 변경이 아니라 **배포 구조 자체가 바뀌는 것**입니다.

**선택지:**

| 옵션 | 장점 | 단점 |
|------|------|------|
| A. Netlify + `@netlify/plugin-nextjs` | 현재 인프라 유지 | ISR 지원이 불안정, 빌드 시간 증가 |
| B. Vercel로 이전 | ISR 네이티브 지원, 가장 안정적 | 플랫폼 이전 비용 |
| C. Netlify + 정적 빌드 유지 + cron 재빌드 | 단순함 | revalidate 불가, 빌드 트리거 필요 |

**의견:** 1000페이지 이상 + ISR이 목표라면 **Vercel이 가장 현실적**입니다. Netlify의 Next.js ISR 지원은 아직 제한적입니다. 만약 Netlify를 유지하고 싶다면 **옵션 C** (cron으로 30분마다 빌드 트리거)가 차선책이지만, 페이지가 1000개 넘으면 빌드 시간이 문제됩니다.

---

### 2. DB 선택: Supabase 추천 (단, 주의사항)

**Supabase가 맞는 이유:**
- PostgreSQL 기반이라 확장성 좋음
- Row Level Security로 API 키 없이도 안전
- 실시간 기능 (나중에 실시간 뉴스 알림 가능)
- 무료 티어로 초기 운영 가능

**주의사항:**
- Supabase 무료 티어는 **500MB 스토리지 + 2GB 전송량**
- 뉴스 1000개 × 요약 300단어 = 약 5~10MB 텍스트 → 충분
- 하지만 **이미지를 Supabase Storage에 넣으면 금방 차니** 이미지는 원본 URL 사용 권장

**테이블 설계 보완:**

```sql
-- 현재 제안에 추가할 컬럼
tags TEXT[]          -- 태그 페이지 생성용
summary_ko TEXT      -- 한국어 요약
summary_en TEXT      -- 영어 요약 (나중에)
source_hash TEXT     -- 중복 제거용 (URL만으로 부족)
status ENUM          -- draft / published / archived
view_count INT       -- 인기 뉴스 정렬용
```

---

### 3. AI 요약 파이프라인: 비용 주의

**파이프라인 설계:**

```
GNews API (10분 주기)
  → 중복 체크 (source_hash)
  → 새 기사만 필터링
  → AI 요약 생성 (Claude API 또는 GPT API)
  → Supabase INSERT
  → ISR이 다음 요청 시 페이지 생성
```

**비용 계산:**
- 하루 100개 기사 × 요약 1회 = 100 API 호출
- Claude Haiku 기준: 입력 500토큰 + 출력 400토큰 = 약 $0.001/건
- **월 약 $3~5** (합리적)

**중복 제거 전략 보완:**
- URL hash만으로는 부족 → 같은 뉴스가 다른 언론사에서 나옴
- **제목 유사도 (Levenshtein distance 또는 cosine similarity)** 추가 필요
- 간단한 방법: 제목에서 조사/특수문자 제거 후 70% 이상 겹치면 중복 판정

---

### 4. 페이지 생성 전략: Dynamic Route 추천

**Static Generation (`generateStaticParams`) vs Dynamic Route:**

1000페이지 이상이면 **빌드 시 전부 생성은 비현실적**입니다.

```tsx
// 추천: Dynamic Route + ISR
// app/news/[slug]/page.tsx

export const revalidate = 3600; // 1시간

export default async function NewsPage({ params }) {
  const article = await getArticleBySlug(params.slug);
  // ...
}

// 선택적으로 인기 기사만 미리 생성
export async function generateStaticParams() {
  const topArticles = await getTopArticles(50); // 상위 50개만
  return topArticles.map(a => ({ slug: a.slug }));
}
```

나머지는 **요청 시 생성 (on-demand ISR)** → 첫 방문자만 약간 느리고, 이후 캐시됨.

---

### 5. slug 생성 전략: 빠뜨리면 안 됨

지시서에 slug 생성 규칙이 없습니다. 이게 SEO에 핵심입니다.

```
좋은 slug: /news/apple-ai-chip-2026-launch
나쁜 slug: /news/12345
나쁜 slug: /news/애플-AI-칩  (한글 URL은 SEO에 불리)
```

**추천 방식:**
- AI 요약 시 영어 slug도 같이 생성하게 하기
- 또는 제목에서 키워드 추출 → slugify

---

### 6. 확장성 문제점

**GNews API 제한:**
- 무료: 100 요청/일
- 유료: 비용 발생

하루 100건이면 초기엔 괜찮지만, 10분 주기 × 24시간 = **144 요청/일** → 무료 초과.

**대안:**
- NewsAPI.org (무료 100건/일, 유료 저렴)
- Google News RSS (무료, 무제한, 구조화 안 됨)
- 여러 소스 혼합 사용

---

### 7. 빠진 것들

지시서에 **포함되어야 할 항목:**

1. **robots.txt 업데이트** - 새 페이지 경로 허용
2. **Google Search Console 재등록** - sitemap 재제출
3. **기존 외부 링크 페이지(`/article`) 처리** - 유지? 제거? 리다이렉트?
4. **뉴스 삭제/만료 정책** - 오래된 기사 어떻게 할지 (404? 아카이브?)
5. **에러 처리** - AI 요약 실패 시 원문 제목+excerpt로 fallback
6. **이미지 전략** - 외부 이미지 URL 직접 사용 vs 프록시
7. **광고 배치** - 뉴스 상세 페이지에 AdSense 어디에 넣을지

---

### 8. 최종 의견 요약

| 항목 | 판단 |
|------|------|
| 전체 방향 | 맞음. 내부 콘텐츠 생성이 SEO 핵심 |
| Netlify + ISR | **위험.** Vercel 이전 또는 cron 재빌드 고려 |
| Supabase | 적합. 무료 티어로 충분히 시작 가능 |
| 1000페이지 목표 | 가능하지만 빌드 전략 필수 (on-demand ISR) |
| AI 요약 비용 | 월 $3~5로 합리적 (Haiku 기준) |
| GNews API | 무료 한계 있음. 복수 소스 고려 |
| 중복 제거 | URL hash + 제목 유사도 병행 필요 |
| 배포 플랫폼 | 이 규모면 Vercel이 가장 적합 |

---

> 이 검토 의견을 반영하여 최종 SSOT 지시서를 작성하면, Claude가 그대로 구현 가능한 수준으로 작업할 수 있습니다.
