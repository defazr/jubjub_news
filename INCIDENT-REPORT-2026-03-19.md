# INCIDENT REPORT — Headlines Fazr (2026-03-19)

## 1. Summary

Production ingest failure and data disappearance were observed.

- `/api/news-status` temporarily returned:
  - `articles_total = 0`
  - `latest_article_time = null`
  - `ingest_ok = false`
- GitHub Actions ingest returned:
  - HTTP 502

However, investigation confirmed:

> **This is NOT caused by recent code changes**
> **This is NOT caused by routing (/category → /topic) changes**
> **This is NOT caused by Claude modifications**

---

## 2. Root Cause

The Supabase project currently connected to production is an old project that has been:

- **Paused since**: 2024-06-24
- **Automatically deactivated** after 90+ days
- **No longer restorable** via dashboard

As a result:

- Database server is no longer accessible
- All DB queries fail
- API endpoints return fallback values (0, null)
- Ingest endpoint fails with 502

**Important:**

> Data is NOT deleted.
> Supabase confirms data is still intact (backup available).
> Only the project runtime is disabled.

---

## 3. Why It "Worked Then Broke"

- The app was unknowingly connected to an old Supabase project
- It continued to function until the project was fully deactivated
- Once deactivation finalized:
  - DB connection started failing
  - Ingest pipeline broke
  - Status API returned empty values

---

## 4. Current System Status

| Component | Status |
|-----------|--------|
| Frontend | ✅ 정상 |
| Routing (/topic) | ✅ 정상 |
| SEO / Discover 구조 | ✅ 정상 |
| Ingest logic | ✅ 정상 |
| DB connection | ❌ broken (project deactivated) |

---

## 5. Required Fix (Infrastructure Only)

**No code changes required.**

Steps:

1. Create a **NEW Supabase project**
2. Restore database from backup (if needed)
3. Update environment variables:
   - `DATABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Redeploy application

---

## 6. Important Instructions

- **DO NOT** modify routing, topic structure, or SEO logic
- **DO NOT** change ingest logic
- **DO NOT** attempt to "fix" this via code

**This is strictly an infrastructure issue.**

---

## 7. Goal

Restore database connectivity so that:

- `/api/news-status` returns correct values
- Ingest pipeline resumes normal operation
- `articles_total` reflects actual DB contents

---

## FINAL NOTE

Recent Claude changes (routing, DB key handling) are **correct and should be kept**.

This incident is unrelated to application logic and is caused solely by **Supabase project lifecycle**.
