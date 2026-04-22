/**
 * articleFilter.ts
 *
 * 뉴스 파이프라인 쓰레기 기사 필터 12가지
 * 뉴스 자동화 사이트 운영 표준 기준
 *
 * 사용: news-ingest에서 import하여 사용
 */

// 쓰레기 기사 12가지 패턴
const JUNK_TITLE_PATTERNS: string[] = [
  // 1. 쿠키/개인정보 페이지
  "cookies",
  "cookie policy",
  "cookie settings",
  "privacy policy",
  "manage consent",
  "manage cookies",

  // 2. 로그인/인증 페이지
  "log in",
  "login",
  "sign in",
  "sign up",
  "create account",
  "register now",
  "authentication required",
  "account required",

  // 3. 구독/페이월 페이지
  "subscribe to continue",
  "subscribe",
  "subscription required",
  "subscription",
  "paywall",
  "premium content",
  "members only",
  "exclusive access",

  // 4. 봇 차단 / Cloudflare / 캡챠 페이지
  "access denied",
  "are you a robot",
  "captcha",
  "verify you are human",
  "bot detected",
  "unusual traffic",
  "checking your browser",
  "cloudflare",

  // 5. 에러/리다이렉트 페이지
  "page not found",
  "404 error",
  "403 forbidden",
  "error 503",
  "temporarily unavailable",
  "under maintenance",
  "redirecting",

  // 6. 아카이브/인덱스 페이지 (비뉴스)
  "tag page",
  "category page",
  "all articles",
  "browse all",
  "article index",
  "archives",

  // 7. 광고/프로모션 페이지
  "sponsored content",
  "sponsored",
  "advertisement",
  "advertorial",
  "partner content",
  "promoted",

  // 8. 뉴스레터 페이지
  "newsletter",
  "daily briefing",
  "morning digest",
  "sign up for our",
  "get our newsletter",

  // 9. 비디오 전용 페이지
  "watch video",
  "video report",
  "watch live",
  "live stream",

  // 10. 기타 비뉴스 콘텐츠
  "terms of service",
  "terms and conditions",
  "contact us",
  "about us",
  "disclaimer",
];

// 제목 regex 패턴
const TITLE_REGEX_PATTERNS = [
  /^no\s+cookies?\s*\|/i,
  /^please\s+(enable|accept|allow)/i,
  /^(you\s+must|you\s+need\s+to)\s+(log|sign|subscribe)/i,
  /^access\s+denied/i,
  /^error\s+\d{3}/i,
  /^just\s+a\s+moment/i,          // Cloudflare
  /^attention\s+required/i,       // Cloudflare
  /^checking\s+(your|if)\s+/i,    // 봇 체크
  /^redirecting/i,                // 리다이렉트
];

// 11. City Portal / Section Page 패턴
// "Jacksonville News, Sports & Restaurants" 같은 포털 페이지
const CITY_PORTAL_PATTERNS = [
  // "CityName News, Sports & ..."
  /^[\w\s]+ news,?\s*(sports|weather|restaurants|politics|updates)/i,
  // "CityName Local Updates"
  /^[\w\s]+ local\s+(updates|news|guide)/i,
  // "Latest CityName News"
  /^latest\s+[\w\s]+ news/i,
];

// 12. Aggregator / Section / Category page 패턴
const AGGREGATOR_PATTERNS = [
  /^Latest World & National News & Headlines$/i,
  /^Entertainment \|.*Reporter-Telegram$/i,
  /^Health & Fitness \| TechRadar$/i,
  /^Just Jared:.*Entertainment$/i,
  /^Russia \| World \| The Guardian$/i,
  /^Arts & Entertainment Calendar \|/i,
  /Reuters .* News Summary \|/i,
  /\| Darts World Magazine$/i,
];

/**
 * 쓰레기 기사 여부 판단 (12가지 패턴)
 *
 * @param title - 기사 제목
 * @param excerpt - 기사 본문/excerpt (optional)
 * @param contentLength - 본문 전체 길이 (optional)
 * @returns true면 스킵해야 하는 쓰레기 기사
 */
export function shouldSkipArticle(
  title: string,
  excerpt?: string | null,
  contentLength?: number | null
): boolean {
  if (!title) return true;

  const titleLower = title.toLowerCase().trim();

  // 12. Content Too Short (가장 강력한 필터)
  // 본문 400자 미만이면 portal/category/cookie 등 거의 다 걸러짐
  if (contentLength != null && contentLength < 400) return true;

  // excerpt만 있을 때: 50자 미만이면 스킵
  if (excerpt != null && !contentLength && excerpt.length < 50) return true;

  // 제목 패턴 매칭 (1~10)
  if (JUNK_TITLE_PATTERNS.some((pattern) => titleLower.includes(pattern))) {
    return true;
  }

  // regex 패턴 매칭
  if (TITLE_REGEX_PATTERNS.some((regex) => regex.test(title))) {
    return true;
  }

  // 11. City Portal / Section Page
  if (CITY_PORTAL_PATTERNS.some((regex) => regex.test(title))) {
    return true;
  }

  // 12. Aggregator / Section / Category pages
  if (AGGREGATOR_PATTERNS.some((regex) => regex.test(title))) {
    return true;
  }

  // 6. Pipe 3개 이상 (SEO 스터핑)
  if ((title.match(/\|/g) || []).length >= 3) return true;

  // 제목과 excerpt 동일 (크롤링 실패)
  if (excerpt) {
    const excerptLower = excerpt.toLowerCase().trim();
    if (titleLower === excerptLower) return true;
    if (excerptLower.length < 100 && excerptLower.includes(titleLower)) {
      return true;
    }
  }

  return false;
}
