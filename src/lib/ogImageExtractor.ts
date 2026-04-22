/**
 * ogImageExtractor.ts
 *
 * 기사 원본 URL에서 og:image 메타태그를 추출하는 유틸리티.
 * ingest와 완전 독립 — 별도 cron으로 비동기 실행.
 */

export async function extractOgImage(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });

    if (!response.ok) return null;

    const fullHtml = await response.text();
    const head = fullHtml.slice(0, 20000);

    const patterns = [
      /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i,
      /<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i,
      /<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i,
      /<meta\s+content=["']([^"']+)["']\s+name=["']twitter:image["']/i,
    ];

    for (const pattern of patterns) {
      const match = head.match(pattern);
      if (match && match[1]) {
        const imageUrl = match[1].trim();
        if (isValidImageUrl(imageUrl)) {
          return resolveUrl(imageUrl, url);
        }
      }
    }

    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function isValidImageUrl(url: string): boolean {
  if (!url || url.length < 10) return false;
  if (url.startsWith("data:")) return false;
  if (url.startsWith("javascript:")) return false;
  if (
    !url.startsWith("http://") &&
    !url.startsWith("https://") &&
    !url.startsWith("//") &&
    !url.startsWith("/")
  )
    return false;
  return true;
}

function resolveUrl(possiblyRelative: string, baseUrl: string): string {
  try {
    if (possiblyRelative.startsWith("//")) {
      return `https:${possiblyRelative}`;
    }
    if (
      possiblyRelative.startsWith("http://") ||
      possiblyRelative.startsWith("https://")
    ) {
      return possiblyRelative;
    }
    return new URL(possiblyRelative, baseUrl).href;
  } catch {
    return possiblyRelative;
  }
}
