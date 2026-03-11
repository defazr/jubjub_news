"use client";

const FALLBACK = "/Headlines_Fazr_OG_image.png";

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
  const imgSrc = src || FALLBACK;

  return (
    <img
      src={imgSrc}
      alt=""
      title={alt}
      className={className}
      loading={loading}
      onError={(e) => applyFallback(e.currentTarget)}
      onLoad={(e) => {
        const t = e.currentTarget;
        if (t.naturalWidth === 0) applyFallback(t);
      }}
    />
  );
}
