"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <Button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      size="icon"
      className="fixed bottom-6 right-6 z-50 h-11 w-11 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground animate-fade-in-up"
      aria-label="맨 위로 스크롤"
    >
      <ArrowUp className="h-5 w-5" />
    </Button>
  );
}
