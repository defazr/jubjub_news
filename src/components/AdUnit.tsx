"use client";

import { useEffect, useRef, useState } from "react";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!pushed.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      } catch {
        // adsbygoogle not loaded yet
      }
    }

    // Poll to check if ad actually rendered with content
    let attempts = 0;
    const check = setInterval(() => {
      attempts++;
      const ins = containerRef.current?.querySelector("ins");
      if (ins) {
        const status = ins.getAttribute("data-ad-status");
        // Only show if ad is filled (not "unfilled") and has real content
        if (status === "filled" || (ins.offsetHeight > 90 && ins.children.length > 0)) {
          setVisible(true);
          clearInterval(check);
        }
        // If AdSense explicitly says unfilled, stop checking
        if (status === "unfilled") {
          clearInterval(check);
        }
      }
      if (attempts >= 15) clearInterval(check);
    }, 500);

    return () => clearInterval(check);
  }, []);

  return (
    <div
      ref={containerRef}
      className={visible ? className : ""}
      style={visible ? undefined : { height: 0, overflow: "hidden", margin: 0, padding: 0 }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-7976139023602789"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}
