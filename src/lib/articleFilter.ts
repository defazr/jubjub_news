/**
 * articleFilter.ts
 *
 * 뉴스 파이프라인 쓰레기 기사 필터
 * - cookie/paywall/login 페이지 차단
 * - 본문 없는 기사 차단
 * - 비뉴스 콘텐츠 차단
 *
 * 사용: news-ingest에서 import하여 사용
 */

// 쓰레기 기사 8가지 패턴
const JUNK_TITLE_PATTERNS: string[] = [
  // 1. 쿠키/개인정보 페이지
  "cookies",
  "cookie policy",
  "cookie settings",
  "privacy policy",
  "manage consent",

  // 2. 로그인/인증 페이지
  "log in",
  "login",
  "sign in",
  "sign up",
  "create account",
  "register now",

  // 3. 구독/페이월 페이지
  "subscribe",
  "subscription",
  "paywall",
  "premium content",
  "members only",
  "exclusive access",

  // 4. 봇 차단 / 캡챠 페이지
  "access denied",
  "are you a robot",
  "captcha",
  "verify you are human",
  "bot detected",
  "unusual traffic",

  // 5. 에러/리다이렉트 페이지
  "page not found",
  "404 error",
  "403 forbidden",
  "error 503",
  "temporarily unavailable",
  "under maintenance",

  // 6. 아카이브/인덱스 페이지 (비뉴스)
  "tag page",
  "category page",
  "all articles",
  "browse all",
  "article index",

  // 7. 광고/프로모션 페이지
  "sponsored content",
  "advertisement",
  "advertorial",
  "partner content",
  "promoted",

  // 8. 기타 비뉴스 콘텐츠
  "terms of service",
  "terms and conditions",
  "contact us",
  "about us",
  "disclaimer",
];

// 제목이 사이트 이름만 있는 패턴 (예: "No Cookies | CODE Sports")
const SITE_NAME_ONLY_PATTERNS = [
  /^no\s+cookies?\s*\|/i,
  /^please\s+(enable|accept|allow)/i,
  /^(you\s+must|you\s+need\s+to)\s+(log|sign|subscribe)/i,
  /^access\s+denied/i,
  /^error\s+\d{3}/i,
  /^just\s+a\s+moment/i,          // Cloudflare 차단
  /^attention\s+required/i,       // Cloudflare 차단
  /^checking\s+(your|if)\s+/i,    // 봇 체크 페이지
];

/**
 * 쓰레기 기사 여부 판단
 *
 * @param title - 기사 제목
 * @param excerpt - 기사 본문/excerpt (optional)
 * @returns true면 스킵해야 하는 쓰레기 기사
 */
export function shouldSkipArticle(
  title: string,
  excerpt?: string | null
): boolean {
  if (!title) return true;

  const titleLower = title.toLowerCase().trim();

  // 1. 본문(excerpt)이 너무 짧으면 스킵 (200자 미만)
  if (excerpt && excerpt.length < 50) return true;

  // 2. 제목이 쓰레기 패턴에 매칭
  if (JUNK_TITLE_PATTERNS.some((pattern) => titleLower.includes(pattern))) {
    return true;
  }

  // 3. 사이트 이름만 있는 패턴 매칭
  if (SITE_NAME_ONLY_PATTERNS.some((regex) => regex.test(title))) {
    return true;
  }

  // 4. 제목과 excerpt가 거의 동일 (크롤링 실패)
  if (excerpt) {
    const excerptLower = excerpt.toLowerCase().trim();
    if (titleLower === excerptLower) return true;
    // 제목이 excerpt에 완전히 포함되고 excerpt가 짧으면 쓰레기
    if (excerptLower.length < 100 && excerptLower.includes(titleLower)) {
      return true;
    }
  }

  return false;
}
