"use client";

const FALLBACK = "/Headlines_Fazr_OG_image.png";

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
      alt={alt}
      className={className}
      loading={loading}
      onError={(e) => {
        const target = e.currentTarget;
        if (target.src !== window.location.origin + FALLBACK) {
          target.src = FALLBACK;
        }
      }}
    />
  );
}
