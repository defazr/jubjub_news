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
    let attempts = 0;
    const maxAttempts = 20;

    const check = setInterval(() => {
      attempts++;

      // Keep trying to push until adsbygoogle is available
      if (!pushed.current) {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          pushed.current = true;
        } catch {
          // adsbygoogle not loaded yet, will retry on next interval
        }
      }

      // Check if ad actually rendered with content
      const ins = containerRef.current?.querySelector("ins");
      if (ins) {
        const status = ins.getAttribute("data-ad-status");
        if (status === "filled" || (ins.offsetHeight > 90 && ins.children.length > 0)) {
          setVisible(true);
          clearInterval(check);
        }
        if (status === "unfilled") {
          clearInterval(check);
        }
      }

      if (attempts >= maxAttempts) clearInterval(check);
    }, 500);

    return () => clearInterval(check);
  }, []);

  return (
    <div
      ref={containerRef}
      className={visible ? className : ""}
      style={visible ? undefined : { display: "none" }}
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
