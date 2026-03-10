export function articleLink(url: string, title: string, source: string): string {
  // Internal URLs (DB articles) link directly to /news/[slug]
  if (url.startsWith('/')) return url;
  return `/article?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&source=${encodeURIComponent(source)}`;
}
