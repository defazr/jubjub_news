# Topic Concept Map 구현 보고서

**날짜**: 2026-03-11
**상태**: 구현 완료, 푸시 완료

---

## 1. 문제

Topic 페이지 일부가 빈 페이지 또는 기사 수 부족:

| 페이지 | 상태 |
|--------|------|
| /topic/apple | 정상 |
| /topic/semiconductor | 정상 |
| /topic/ai | 빈 페이지 또는 기사 부족 |
| /topic/gpu | 빈 페이지 |
| /topic/crypto | 빈 페이지 |

Ingest 파이프라인은 정상 동작 중:

```
fetched: 225  inserted: 16  duplicates: 209  summaries: 16
```

## 2. 원인 분석

### 기존 쿼리 방식 (articles.ts:116)

```typescript
.or(`keywords.cs.{${keyword}},title.ilike.%${keyword}%`)
```

- `keywords` 배열에 정확히 해당 키워드가 있거나
- `title`에 해당 키워드가 포함된 기사만 반환

### 왜 /topic/ai가 빈 페이지인가

AI 관련 기사의 실제 keywords 예시:

```json
["openai", "chatgpt", "llm", "deep learning"]
["nvidia", "gpu", "datacenter"]
["anthropic", "claude", "ai safety"]
```

- "ai"라는 정확한 키워드가 없는 기사가 대부분
- AI 관련이지만 "ai" 문자열이 title에도 없는 경우 다수

**결론: 파이프라인 문제가 아닌 taxonomy(분류 체계) 문제**

## 3. 해결 방법: Topic Concept Map

### 설계 원칙

1. `articles.ts` 수정 금지 → 새 파일에 별도 구현
2. DB schema 변경 없음
3. Ingest 파이프라인 변경 없음
4. ISR 캐시 정책 유지 (`revalidate = 300`)
5. 개별 브랜드 토픽(nvidia, apple 등)은 확장하지 않음

### 구현 파일

**새 파일: `src/lib/topicConcepts.ts`**

```typescript
const TOPIC_CONCEPTS: Record<string, string[]> = {
  ai: ["ai", "artificial intelligence", "machine learning", "deep learning",
       "llm", "openai", "chatgpt", "gpt5", "gemini", "copilot",
       "deepseek", "anthropic", "claude"],
  crypto: ["crypto", "bitcoin", "ethereum", "blockchain", "defi"],
  ev: ["ev", "electric vehicle", "battery", "charging"],
  semiconductor: ["semiconductor", "chip", "chipmaker", "foundry", "tsmc"],
  cybersecurity: ["cybersecurity", "cyber security", "hacking",
                  "ransomware", "data breach"],
  cloud: ["cloud", "cloud computing", "aws", "azure", "gcp"],
  space: ["space", "nasa", "spacex", "satellite", "rocket"],
  quantum: ["quantum", "quantum computing", "qubit"],
  robot: ["robot", "robotics", "automation"],
  startup: ["startup", "venture capital", "vc", "funding", "unicorn"],
};
```

### 쿼리 동작 방식

```
/topic/ai 접속 시:

기존: WHERE keywords @> {ai} OR title ILIKE '%ai%'
변경: WHERE keywords @> {ai}
       OR keywords @> {openai}
       OR keywords @> {chatgpt}
       OR keywords @> {llm}
       OR keywords @> {deep learning}
       OR ... (13개 키워드)
       OR title ILIKE '%ai%'
```

### 수정된 파일

**`src/app/topic/[keyword]/page.tsx`**

```diff
- import { getArticlesByKeyword, getPopularKeywords } from "@/lib/articles";
+ import { getPopularKeywords } from "@/lib/articles";
+ import { getArticlesByConceptTopic, getTopicDescription } from "@/lib/topicConcepts";

- const desc = `Latest news and AI summaries about ${decoded}...`;
+ const desc = getTopicDescription(decoded) || `Latest news and AI summaries about ${decoded}...`;

- getArticlesByKeyword(decoded, 50),
+ getArticlesByConceptTopic(decoded, 50),
```

## 4. 매핑되지 않은 토픽

| 토픽 | 동작 |
|------|------|
| nvidia | 기존 방식 (정확한 키워드 매칭) |
| apple | 기존 방식 |
| tesla | 기존 방식 |
| google | 기존 방식 |
| microsoft | 기존 방식 |

개별 브랜드/제품은 concept map 없이 정확한 매칭이 적합합니다.

## 5. GPT 제안과의 차이

### GPT 제안

```
ai concept에 nvidia, gpu, semiconductor, datacenter 포함
```

### 실제 구현 (다르게 함)

```
ai concept에 nvidia, gpu, semiconductor 미포함
```

### 이유

- nvidia 기사가 전부 /topic/ai에 나오면 taxonomy 왜곡
- /topic/nvidia와 /topic/ai의 결과가 과도하게 중복
- 각 토픽의 고유성 유지가 SEO에 유리

## 6. SEO 개선

토픽별 맞춤 meta description 추가:

```
/topic/ai →
"Latest news about artificial intelligence, machine learning,
LLMs, ChatGPT, and AI industry developments."

/topic/crypto →
"Breaking news on cryptocurrency, Bitcoin, Ethereum,
blockchain technology, and DeFi markets."
```

매핑되지 않은 토픽은 기존 generic description 유지.

## 7. 변경하지 않은 것

| 항목 | 상태 |
|------|------|
| articles.ts | 수정 없음 (수정 금지) |
| DB schema | 변경 없음 |
| Ingest pipeline | 변경 없음 |
| ISR 캐시 (revalidate = 300) | 유지 |
| notFound() | 이전 커밋에서 이미 제거됨 |
| TypeScript errors | 0 |

## 8. 향후 확장

새 concept 추가 시 `topicConcepts.ts`의 `TOPIC_CONCEPTS`에 항목 추가만 하면 됩니다:

```typescript
// 예시: 5g 토픽 추가
"5g": ["5g", "6g", "wireless", "telecom", "spectrum"],
```
