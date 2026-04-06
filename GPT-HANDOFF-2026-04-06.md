# Headlines Fazr — GPT 핸드오프 (2026-04-06)

## 이번 세션 작업 요약

### 출력 레이어 콘텐츠 필터 (완료, 배포됨)

**문제:**
- USA TODAY "Latest World & National News & Headlines" 껍데기 기사가 홈/topic에 10~15건 중복 노출
- 동일 title 중복 기사 (ICE detention 관련 2건 등)
- AI 실패 summary 노출 가능성

**제약:**
- `articles.ts` 수정 금지
- `news-ingest/route.ts` 수정 금지
- DB 변경 금지

**해결 (커밋 `75a1698`):**

신규 파일 `src/lib/contentFilter.ts` 생성:

```typescript
filterArticles(articles, options?)
```

처리 순서:
1. Boilerplate 제거 — normalizeTitle() 후 블랙리스트 매칭
2. Title dedup — normalized title 기준 Set, 첫 번째만 유지
3. Failed summary — "I cannot" 등 AI 거부 패턴 감지

적용:
- AI 페이지: `{ excludeFailedSummary: true }` → 실패 기사 완전 제외
- 나머지 (홈, topic, category × 7): summary만 null 처리, 기사 유지

**수정 파일 (12개):**
- `src/lib/contentFilter.ts` (신규)
- `src/app/page.tsx` (홈)
- `src/app/ai/page.tsx`
- `src/app/topic/[keyword]/page.tsx`
- `src/app/category/{culture,tech,world,opinion,politics,economy,society,sports}/page.tsx` (7개)

**ISR 캐시 참고:**
- 배포 직후에는 이전 캐시 서빙
- 홈페이지: 15분 후 반영
- topic/category: 30분~1시간 후 반영

---

## 사전 확인 결과 (코드 수정 전)

### GSC 404 확인 (4건)
| URL | HTTP | 결과 |
|-----|------|------|
| /topic/gemini | 200 | 정상 (기사 2+) |
| /topic/gpt5 | 200 | 빈 페이지 → sitemap 자동 제외됨 (4/2 작업) |
| /topic/copilot | 200 | 정상 (기사 2+) |
| /topic/bodo/glimt | 404 | 보류 (영향 없음) |

### DB 상태
- 총 기사 수: 2,616
- "I cannot" 등 실패 summary: 사이트 표면에서 미발견 (코드에 필터 없었으므로 예방 차원 적용)
- "Latest World & National News & Headlines" 중복: 홈 5건, /topic/world 11건

---

## 현재 시스템 상태

| 항목 | 상태 |
|---|---|
| 기사 수 | 2,616+ |
| 파이프라인 | 정상 (24h 75건, 1h 27건) |
| ISR revalidate | 상향 완료 (4/1) |
| sitemap | 빈 topic 자동 제외 (4/2) |
| 콘텐츠 필터 | 출력 레이어 적용 (4/6) |
| CLAUDE.md | v1.2 |
| Netlify | 자동 배포 ON |

---

## 보류 중인 작업

1. /category/:slug → /topic/:slug 301 리다이렉트
2. /topic/ai ilike %ai% 제거 (false positive)
3. /ai 페이지 필터 또는 타이틀 수정
4. iphone, 5g sitemap 대소문자 이슈
5. 공백 slug 83개

실행 트리거: impressions 증가 / 클릭 10+ / CTR 정체

---

## 수정 금지 (항상)

- `src/lib/articles.ts`
- `src/app/api/news-ingest/route.ts`
- Supabase schema
- DB/API/URL/아키텍처 구조
- CORE_KEYWORDS 배열

---

## 참고 문서

| 문서 | 용도 |
|------|------|
| `CLAUDE.md` | 프로젝트 SSOT (운영 지시서 v1.2) |
| `GPT-HANDOFF-2026-04-02.md` | 이전 GPT 핸드오프 (sitemap 필터) |
| `GPT-HANDOFF-2026-04-01.md` | ISR writes 최적화 핸드오프 |
| `SESSION-HANDOFF-2026-04-06.md` | Claude 세션 핸드오프 |
