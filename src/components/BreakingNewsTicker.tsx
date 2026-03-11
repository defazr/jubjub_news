"use client";

import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";

interface Props {
  items: string[];
}

export default function BreakingNewsTicker({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <div className="bg-primary text-primary-foreground overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4 flex items-center">
        <Badge
          variant="secondary"
          className="shrink-0 gap-1 rounded-sm bg-primary-foreground/15 text-primary-foreground border-0 px-3 py-1.5 text-xs font-bold"
        >
          <Zap className="h-3 w-3 fill-current" />
          Breaking
        </Badge>
        <div className="overflow-hidden py-2.5 pl-4">
          <div className="animate-marquee whitespace-nowrap">
            {items.map((news, i) => (
              <span key={i} className="text-sm mx-8 font-medium">
                {news}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
