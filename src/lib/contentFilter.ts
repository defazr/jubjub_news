/**
 * contentFilter.ts
 *
 * 출력 레이어 콘텐츠 정화 (boilerplate 제거, title dedup, 실패 summary 처리)
 * articles.ts 수정 없이 각 페이지에서 사용
 */

import type { Article } from "@/types/database";

/** Normalize title for dedup comparison */
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s*\|\s*(usa today|reuters|ap news|the guardian|associated press)[^|]*$/i, "")
    .replace(/\s*-\s*(usa today|reuters|ap news|the guardian|associated press)[^-]*$/i, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Known boilerplate titles (normalized) */
const BOILERPLATE_TITLES = new Set([
  "latest world national news headlines",
  "latest world national news headlines usa today",
]);

function isBoilerplate(title: string): boolean {
  return BOILERPLATE_TITLES.has(normalizeTitle(title));
}

/** AI failure patterns in summary */
const FAILED_SUMMARY_PATTERNS = [
  "i cannot",
  "i can't",
  "unable to",
  "i'm unable",
  "i appreciate your request, but",
  "i do not have access",
];

function isFailedSummary(summary: string | null): boolean {
  if (!summary) return false;
  const lower = summary.toLowerCase();
  return FAILED_SUMMARY_PATTERNS.some((p) => lower.includes(p));
}

interface FilterOptions {
  excludeFailedSummary?: boolean;
}

/**
 * Filter articles for display:
 * 1. Remove boilerplate titles
 * 2. Deduplicate by normalized title (keep first)
 * 3. Handle failed summaries (exclude or nullify)
 */
export function filterArticles(
  articles: Article[],
  options?: FilterOptions
): Article[] {
  const seen = new Set<string>();
  const result: Article[] = [];

  for (const article of articles) {
    // 1. Boilerplate removal
    if (isBoilerplate(article.title)) continue;

    // 2. Title dedup
    const normalized = normalizeTitle(article.title);
    if (seen.has(normalized)) continue;
    seen.add(normalized);

    // 3. Failed summary handling
    if (isFailedSummary(article.summary)) {
      if (options?.excludeFailedSummary) continue;
      result.push({ ...article, summary: null });
      continue;
    }

    result.push(article);
  }

  return result;
}
