# Headlines Fazr — GPT 핸드오프 (2026-04-02)

## 이번 세션 작업 요약

### sitemap-topics.xml 빈 topic 자동 필터링 (완료)

**문제:**
- GSC에서 /topic/gpt5, /topic/bodo/glimt 등 404 보고
- CORE_KEYWORDS에 하드코딩된 gpt5, deepseek이 기사 0건인데 sitemap 포함
- Google이 빈 페이지 반복 크롤링 → 신뢰도 저하 위험

**수정 (커밋 `d992af2`):**
- `src/app/sitemap-topics.xml/route.ts`에서 CORE_KEYWORDS 기사 존재 여부 자동 체크
- topic 페이지와 동일 기준: `keywords.cs OR title.ilike`
- 32개 CORE_KEYWORDS 병렬 count 쿼리, revalidate 3600 캐싱 유지

**결과:**
- gpt5, deepseek → 자동 제외
- ai, bitcoin, tesla, crypto 등 → 정상 포함
- 총 topic: 229 → 225개

---

## 전수 점검 결과

### 빈 topic (기사 0건)
- gpt5, deepseek → sitemap에서 자동 제외됨

### 공백 slug (83개)
- `ai%20adoption`, `artificial%20intelligence`, `trump%20administration` 등
- DB에서 자동 추출된 키워드, 기사 있음, 동작 정상
- 지금은 건드리지 않음

### 깨진 slug
- /topic/bodo/glimt → 404 (슬래시 포함), sitemap 미포함, 영향 없음

### 대소문자 이슈
- iphone, 5g → sitemap 누락 추정 (영향도 낮아 보류)

---

## 현재 시스템 상태

- 기사 수: 1,818+
- ISR revalidate: 전체 상향 완료 (2026-04-01)
- sitemap: 빈 topic 자동 필터링 완료
- Netlify 배포: 수동 (Activate builds → deploy → 다시 끄기)

---

## 다음 액션 트리거

1. impressions 증가
2. 클릭 10+
3. CTR 정체

→ 그때: AI 필터 정리, topic 정제, CTR 개선

---

## 수정 금지 (항상)

- `src/lib/articles.ts`
- `src/app/api/news-ingest/route.ts`
- Supabase schema
- DB/API/URL/아키텍처 구조
- CORE_KEYWORDS 배열 자체
