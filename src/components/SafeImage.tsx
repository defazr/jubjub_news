"use client";

const FALLBACK = "/Headlines_Fazr_OG_image.png";

/** Strip query params from external image URLs (fixes CDN 422 errors) */
function sanitizeImageUrl(url: string): string {
  if (!url || url.startsWith("/")) return url;
  try {
    const u = new URL(url);
    if (u.search) return u.origin + u.pathname;
  } catch {
    // not a valid URL, return as-is
  }
  return url;
}

function isFallback(el: HTMLImageElement) {
  return el.src === window.location.origin + FALLBACK || el.src === FALLBACK;
}

function applyFallback(el: HTMLImageElement) {
  if (!isFallback(el)) {
    el.src = FALLBACK;
    el.alt = "";
  }
}

export default function SafeImage({
  src,
  alt,
  className,
  loading,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
}) {
  const imgSrc = src ? sanitizeImageUrl(src) : FALLBACK;

  return (
    <img
      src={imgSrc}
      alt={alt || "news image"}
      title={alt}
      className={className}
      loading={loading || "lazy"}
      onError={(e) => applyFallback(e.currentTarget)}
      onLoad={(e) => {
        const t = e.currentTarget;
        if (t.naturalWidth === 0) applyFallback(t);
      }}
    />
  );
}
