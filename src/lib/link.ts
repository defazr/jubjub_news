export function articleLink(url: string, title: string, source: string): string {
  return `/article?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&source=${encodeURIComponent(source)}`;
}
