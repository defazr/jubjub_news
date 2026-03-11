"use client";

import { useEffect, useRef, useState } from "react";

// AdSense slot ID mapping
const SLOT_MAP: Record<string, string> = {
  "top-article": "9121339058",     // headlines_01
  "mid-article": "2248808942",     // headlines_02
  "bottom-article": "9121339058",  // headlines_01
  "top-ai": "9121339058",          // headlines_01
  "bottom-ai": "2248808942",       // headlines_02
  "top-home": "9121339058",        // headlines_01
  "bottom-home": "2248808942",     // headlines_02
  "top-topic": "9121339058",       // headlines_01
  "bottom-topic": "2248808942",    // headlines_02
};

interface Props {
  slot: string;
  format?: string;
  responsive?: boolean;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function AdUnit({
  slot,
  format = "auto",
  responsive = true,
  className = "",
}: Props) {
  const pushed = useRef(false);
  const [mounted, setMounted] = useState(false);

  // Resolve text slot names to numeric IDs
  const slotId = SLOT_MAP[slot] || slot;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || pushed.current) return;

    const timer = setTimeout(() => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      } catch {
        // adsbygoogle not ready yet
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [mounted]);

  // Don't render ad on server to avoid hydration mismatch
  if (!mounted) {
    return <div className={className} />;
  }

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-7976139023602789"
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}
