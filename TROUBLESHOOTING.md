# JubJub News - 현재 상태 및 문제 해결 가이드

## 현재 상태 요약

### Phase 3 완료 작업
1. **news-proxy 완전 제거** — `netlify/functions/news-proxy.ts` 삭제
2. **모든 페이지 Supabase DB 전환 완료**
   - 홈페이지, 카테고리, 해외뉴스, 검색 → 모두 Supabase에서 조회
3. **Topic 페이지 SEO 강화** — OG tags, canonical, 관련 토픽 internal linking
4. **API route 생성** — `/api/articles` (클라이언트 페이지용)

### 현재 데이터 흐름
```
[뉴스 수집]
RapidAPI → news-ingest (4시간 CRON) → Claude 요약 → Supabase DB 저장

[사용자 요청]
홈페이지/카테고리/토픽 (SSR) → articles.ts → Supabase DB 조회
해외뉴스/검색 (Client) → /api/articles → Supabase DB 조회
```

---

## 홈페이지에 뉴스가 안 나오는 문제

### 진단 방법

배포 후 브라우저에서 이 URL을 열어주세요:

```
https://headlines.fazr.co.kr/api/articles?action=debug
```

JSON 응답이 나옵니다. 아래 3가지 케이스를 확인하세요.

---

### 케이스 1: DB가 비어있음

```json
{
  "totalArticles": 0,
  "hasServiceKey": true,
  "error": null,
  "latestArticles": []
}
```

**원인**: `news-ingest` CRON이 아직 한 번도 실행되지 않음

**해결 방법**: Netlify에서 수동으로 news-ingest 실행

1. [Netlify 대시보드](https://app.netlify.com) → 사이트 선택
2. **Functions** 탭 클릭
3. `news-ingest` 함수 찾기
4. 직접 트리거하거나, 브라우저에서 아래 URL 호출:

```
https://headlines.fazr.co.kr/.netlify/functions/news-ingest?secret=sb_secret_C1bcaG6
```

> `secret` 값은 `SUPABASE_SERVICE_ROLE_KEY`의 앞 16글자입니다.

5. 성공 시 응답 예시:
```json
{
  "success": true,
  "stats": {
    "fetched": 150,
    "inserted": 120,
    "duplicates": 30,
    "errors": 0,
    "summaries": 80
  }
}
```

6. 뉴스 수집 완료 후 홈페이지를 새로고침하면 뉴스가 나옵니다 (ISR 5분).

---

### 케이스 2: Service Role Key 미설정

```json
{
  "totalArticles": null,
  "hasServiceKey": false,
  "error": "..."
}
```

**원인**: Netlify에 `SUPABASE_SERVICE_ROLE_KEY` 환경변수가 설정되지 않음

**해결 방법**:

1. [Netlify 대시보드](https://app.netlify.com) → 사이트 선택
2. **Site configuration** → **Environment variables**
3. 아래 환경변수들이 모두 설정되어 있는지 확인:

| 변수명 | 설명 |
|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (공개) 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role (관리자) 키 |
| `RAPIDAPI_KEY` | RapidAPI 뉴스 API 키 |
| `ANTHROPIC_API_KEY` | Claude AI 요약용 API 키 |

4. `SUPABASE_SERVICE_ROLE_KEY` 확인 방법:
   - [Supabase 대시보드](https://supabase.com/dashboard) → 프로젝트 선택
   - **Settings** → **API** → **service_role** 키 복사
   - 이 키는 `eyJhbGciOi...` 형태의 JWT 토큰입니다

5. 환경변수 추가 후 **Deploys** → **Trigger deploy** → **Clear cache and deploy site**

---

### 케이스 3: RLS 정책 문제

```json
{
  "totalArticles": null,
  "hasServiceKey": true,
  "error": "permission denied for table articles"
}
```

**원인**: Supabase Row Level Security (RLS)가 활성화되어 있지만 읽기 정책이 없음

**해결 방법**:

1. [Supabase 대시보드](https://supabase.com/dashboard) → 프로젝트 선택
2. **SQL Editor** 클릭
3. 아래 SQL 실행:

```sql
-- articles 테이블에 공개 읽기 정책 추가
CREATE POLICY "Allow public read access"
  ON articles
  FOR SELECT
  USING (true);
```

또는 RLS 자체를 비활성화 (뉴스는 공개 데이터이므로):

```sql
ALTER TABLE articles DISABLE ROW LEVEL SECURITY;
```

---

## 체크리스트

배포 후 확인할 사항:

- [ ] `/api/articles?action=debug` 응답 확인
- [ ] `totalArticles`가 0이면 → news-ingest 수동 실행
- [ ] `hasServiceKey`가 false이면 → Netlify 환경변수 설정
- [ ] `error`가 있으면 → RLS 정책 추가
- [ ] 위 모든 해결 후 홈페이지 새로고침 (5분 ISR 대기)

---

## 변경된 파일 목록 (Phase 3)

| 파일 | 변경 내용 |
|------|----------|
| `netlify/functions/news-proxy.ts` | **삭제** |
| `src/lib/api.ts` | `fetchTrendingNews`, `searchNews` 제거 |
| `src/lib/articles.ts` | admin client 사용 + anon fallback + 에러 로깅 |
| `src/app/page.tsx` | trending 비면 latest로 fallback |
| `src/app/world/page.tsx` | Supabase API route로 전환 |
| `src/app/search/page.tsx` | Supabase API route로 전환 |
| `src/components/CategoryPage.tsx` | searchNews fallback 제거 |
| `src/app/topic/[keyword]/page.tsx` | SEO 강화 + 관련 토픽 |
| `src/app/api/articles/route.ts` | **신규** - 클라이언트용 API + debug |
