"use client";

import { useEffect, useRef, useState } from "react";

// AdSense slot ID mapping — 5 unique slots, no duplicates per page
const SLOT_MAP: Record<string, string> = {
  // Article pages (3 slots)
  "top-article": "9121339058",     // headlines_01
  "mid-article": "2248808942",     // headlines_02
  "bottom-article": "2658112296",  // headlines_03
  // AI pages
  "top-ai": "9121339058",          // headlines_01
  "mid-ai": "2248808942",          // headlines_02
  "bottom-ai": "2658112296",       // headlines_03
  // Home page (2 slots)
  "top-home": "9121339058",        // headlines_01
  "bottom-home": "9626486537",     // headlines_04
  // Topic / Trending pages (2 slots)
  "top-topic": "6704809725",       // headlines_05
  "bottom-topic": "2658112296",    // headlines_03
  // Sidebar
  "sidebar": "9626486537",         // headlines_04
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
