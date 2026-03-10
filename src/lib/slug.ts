/**
 * Generate URL-friendly slug from article title
 * e.g. "NVIDIA AI Chip Demand Surges!" → "nvidia-ai-chip-demand-surges"
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/['']/g, "") // remove apostrophes
    .replace(/[^a-z0-9\s-]/g, "") // remove special chars (keeps only ascii)
    .replace(/\s+/g, "-") // spaces to hyphens
    .replace(/-+/g, "-") // collapse multiple hyphens
    .replace(/^-|-$/g, "") // trim leading/trailing hyphens
    .slice(0, 80); // limit length
}

/**
 * Create a hash from source URL for duplicate detection
 */
export function createSourceHash(sourceUrl: string): string {
  // Simple hash using Web Crypto-compatible approach
  let hash = 0;
  for (let i = 0; i < sourceUrl.length; i++) {
    const char = sourceUrl.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}
