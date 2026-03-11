# JubJub News 남은 작업 계획서

## 현재 상태 요약
- 번역 방향 수정 완료 (`"en"` → `"ko"`)
- robots.txt 존재 (sitemap URL 참조하지만 실제 sitemap 파일 없음)
- backfill-summaries API 이미 존재 (Claude Haiku 사용)
- AI 페이지 광고 슬롯 2개 이미 존재 (top-ai, bottom-ai)

---

## 작업 1: /topic/[keyword] 검색 개선
**문제:** `keywords` 배열에 정확히 일치하는 값이 없으면 기사 0개 표시
**해결:** title ILIKE 검색을 추가하여 키워드가 제목에 포함된 기사도 표시

**수정 파일:** `src/lib/articles.ts` → `getArticlesByKeyword` 함수
**변경 내용:**
```
현재: .contains("keywords", [keyword])
변경: .or(`keywords.cs.{${keyword}},title.ilike.%${keyword}%`)
```

---

## 작업 2: AI 페이지 중간 광고 슬롯 추가
**문제:** 홈페이지는 광고 5개, AI 페이지는 2개뿐
**해결:** AI 페이지 기사 목록 중간에 광고 슬롯 1개 추가

**수정 파일:** `src/app/ai/page.tsx`

---

## 작업 3: sitemap.xml 생성
**문제:** robots.txt가 sitemap.xml을 참조하지만 실제 파일 없음
**해결:** Next.js의 sitemap.ts 방식으로 동적 sitemap 생성

**생성 파일:**
- `src/app/sitemap.ts` — 메인 사이트맵 (뉴스 기사 + 토픽 페이지 URL 포함)

**포함 URL:**
- `/` (홈)
- `/ai` (AI 뉴스)
- `/news/[slug]` (전체 기사)
- `/topic/[keyword]` (인기 키워드별)

---

## 작업 4: 기존 기사 summary backfill 실행 안내
**상태:** API 이미 존재 (`/api/backfill-summaries?secret=INGEST_SECRET`)
**작업:** 사용자에게 실행 방법 안내 (배포 환경에서 호출 필요)

---

## 작업 순서
1. /topic/[keyword] 검색 개선 (쿼리 1줄 수정)
2. AI 페이지 중간 광고 추가
3. sitemap.ts 생성
4. 커밋 & 푸시
