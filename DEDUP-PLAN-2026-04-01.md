# Headlines Fazr — 중복 기사(Duplicate Content) 분석 및 향후 개선 계획

## 1. 현재 상황 요약

Headlines Fazr에서 동일하거나 유사한 뉴스가 여러 번 노출되는 현상이 발생하고 있음.

대표 사례:
- 동일 기사 (예: USA TODAY) 2~3회 반복 노출
- AI Summary 섹션에서 동일 내용 반복
- World / Top Stories / AI 섹션 간 중복

---

## 2. 기존 GPT 분석 검토

### GPT가 틀린 부분

"중복 제거 로직 없음" → 틀림

현재 시스템에는 이미 중복 제거 로직이 존재함:

1. articles.ts (line 48) — source_url 기준 dedup 함수 존재. 대부분 쿼리에서 사용됨
2. topicConcepts.ts (line 158) — topic 쿼리 별도 dedup 적용
3. /api/news-ingest/route.ts (line 329) — ingest 단계에서 해시 기반 중복 필터링 존재

결론: dedup 로직은 존재하지만, 기준이 제한적이다

### GPT가 맞게 짚은 부분

- 동일 기사라도 다른 URL로 들어온다는 점
- title 기반 dedup 필요성
- SEO 품질에 부정적 영향 가능성
- 지금 수정하지 말아야 한다는 타이밍 판단

---

## 3. 실제 문제의 본질

현재 dedup 기준: source_url 기준

하지만 실제 데이터는:
- https://usatoday.com/story/abc
- https://usatoday.com/story/abc?utm=twitter
- https://eu.usatoday.com/story/abc

서로 다른 URL로 인식됨

결과: 같은 기사 → 서로 다른 데이터로 저장 → dedup 통과

---

## 4. 문제 정의 (핵심)

현재 dedup = URL 기준 (불완전)
필요 dedup = 콘텐츠 기준 (title 중심)

---

## 5. 현재 단계에서의 판단

지금은 수정하지 않는다

이유:
- 현재는 "데이터 축적 단계"
- Google 색인 및 학습 진행 중
- 구조 변경 시 SEO 영향 가능

---

## 6. 향후 해결 방향

목표: 중복 기사 노출 최소화 (70~90% 감소)

제약 조건:
- articles.ts 수정 금지
- DB 구조 변경 금지
- ingest 로직 유지

즉, 출력 레이어에서 해결해야 함

---

## 7. 해결 전략

### 1단계: Title Normalize 기반 Dedup 추가

개념: title → normalize → 동일 여부 판단

예시:
- "Latest World News - USA TODAY"
- "Latest World News | USA TODAY"
→ 동일 기사로 판단

### Normalize 방식

- 소문자 변환
- 특수문자 제거
- 불필요 suffix 제거 ("| USA TODAY", "- Reuters" 등)
- 공백 정리

### 적용 위치

UI / 데이터 반환 직전 레이어

예:
- getArticles()
- getTopicArticles()
- Digest 생성 로직

기존 dedup 이후 2차 필터로 적용

### 우선 적용 대상

1. AI Summary
2. Top Stories
3. World 섹션
4. Topic 페이지

---

## 8. 적용 타이밍

다음 조건 중 하나 충족 시 실행:

1. impressions 증가
2. 클릭 발생 시작
3. CTR 낮음 확인

---

## 9. 기대 효과

- 중복 기사 70~90% 감소
- UX 개선
- SEO 품질 향상
- Discover 진입 가능성 증가

---

## 10. 리스크

- 잘못된 dedup → 다른 기사 제거 가능성
- 과도한 필터링 → 콘텐츠 다양성 감소

초기에는 보수적으로 적용 필요

---

## 11. 향후 확장 (옵션)

- title + source 조합 dedup
- embedding 기반 유사도 dedup (장기)

---

## 12. 최종 결론

문제: dedup 로직 부재가 아니라 기준의 한계
해결: title 기반 2차 dedup 추가
타이밍: 지금이 아니라 트래픽 발생 이후

---

## 13. 다음 액션 (TODO)

- [ ] title normalize 함수 설계
- [ ] UI 레이어 dedup 구조 설계
- [ ] 테스트 데이터 기준 정확도 검증
- [ ] 적용 시점 판단 (Search Console 기준)
- [ ] 단계적 적용 (section별)
