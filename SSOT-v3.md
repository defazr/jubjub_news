# JubJub / Headlines News Platform
## SSOT v3 — Final Architecture Specification

**Project:** headlines.fazr.co.kr

**Goal:**
API 기반 뉴스 뷰어 → SEO 뉴스 플랫폼 → 자동 뉴스 수집 + AI 요약 → 광고 수익

---

## 1. Current System (Existing Architecture)

```
RapidAPI (news-api14)
   ↓
Netlify Serverless Proxy
   ↓
Browser
   ↓
Memory Cache (5 min) + localStorage Cache (3 hours)
   ↓
UI Rendering
```

**Problem:**
- 뉴스 데이터 저장 없음
- 서버 DB 없음
- 뉴스 페이지 없음
- SEO 트래픽 생성 불가
- API 호출이 방문자 수에 비례

---

## 2. Target Architecture

```
RapidAPI (news-api14)
      ↓
CRON Ingestion Service
      ↓
Supabase PostgreSQL
      ↓
Next.js (SSR)
      ↓
User
```

**Core change:** API → DB → User

---

## 3. News API (Current Source)

- **Provider:** RapidAPI `news-api14.p.rapidapi.com`
- **Endpoints:** `/v2/trendings`, `/v2/search/articles`
- **Note:** `/v2/article` availability unknown — initial system uses `title + excerpt`

---

## 4. News Ingestion System

| Item | Value |
|------|-------|
| Method | CRON job |
| Schedule | Every 4–6 hours |
| Daily runs | 4–6 executions |
| Expected articles | 50–80 / day |

**Categories:**
technology, business, science, world, sports, health, entertainment, ai

**Flow:**
1. Fetch trending
2. Fetch category searches
3. Normalize data
4. Remove duplicates (source_hash)
5. Generate slug
6. Generate AI summary
7. Insert into database

---

## 5. Database (Supabase PostgreSQL)

**Table: `articles`**

| Column | Type |
|--------|------|
| id | uuid primary key |
| title | text |
| slug | text unique |
| summary | text |
| excerpt | text |
| source_url | text |
| image_url | text |
| publisher | text |
| category | text |
| keywords | text[] |
| published_at | timestamp |
| created_at | timestamp |
| source_hash | text |

**Duplicate prevention:** `source_hash = hash(source_url)`

---

## 6. AI Summary Generation

- **Model:** Claude Haiku
- **Input:** title + excerpt
- **Output:** 150–200 word summary
- **Storage:** `summary` column

---

## 7. Slug Generation

- **Format:** `/news/{slug}`
- **Example:** `/news/nvidia-ai-chip-demand`
- **Rules:** lowercase, hyphen-separated, no special characters

---

## 8. Article Page

**Route:** `/news/[slug]`

**Content:**
- Title
- Featured image
- AI summary
- Source attribution
- Original article link
- Related articles

**Ads:** top, mid-article, bottom

---

## 9. Topic Pages

**Route:** `/topic/[keyword]`

Generated from article `keywords` column.

**Examples:** `/topic/ai`, `/topic/openai`, `/topic/nvidia`

---

## 10. Migration Plan (Critical Order)

> Existing proxy must NOT be removed immediately.

1. Create Supabase database
2. Implement CRON ingestion
3. Store articles in database
4. Convert homepage to DB queries
5. Convert category pages to DB queries
6. Remove API proxy endpoints (last)

---

## 11. Translation System

- **Current:** Translation toggle (keep as-is)
- **Future (>1000 articles):** `/ko/news/slug` URL structure

---

## 12. Next.js Configuration

**Required changes:**
- Remove `output: "export"` from `next.config.ts`
- Add `@netlify/plugin-nextjs`
- Enable SSR + dynamic pages

---

## 13. Supabase Setup

> Project creation must be done manually at supabase.com

**Claude responsibilities:**
- Write SQL schema
- Implement Supabase client
- Create data insertion logic
- Create article queries

---

## 14. Expected Growth

| Period | Articles |
|--------|----------|
| Daily | ~50 |
| 3 months | ~4,500 |
| SEO impact | 3–6 months |

---

## 15. Claude Implementation Tasks

1. Supabase SQL schema
2. News ingestion cron script
3. Duplicate detection logic
4. Slug generator
5. AI summary integration
6. `/news/[slug]` page
7. Topic pages
8. Homepage → DB queries
9. Category pages → DB queries

---

## 16. Brand

- **Site name:** Headlines
- **Domain:** headlines.fazr.co.kr
- **Brand:** Headlines by Fazr

---

## Final Statement

**Current:** API-driven news viewer
**Target:** SEO-driven automated news platform
**Core transformation:** API → Database → Content Pages
