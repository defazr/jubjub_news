import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

interface Props {
  keywords: string[];
  /** Keyword to exclude (e.g. current topic page keyword) */
  exclude?: string;
  className?: string;
}

export default function TrendingTopics({ keywords, exclude, className = "" }: Props) {
  const filtered = exclude
    ? keywords.filter((kw) => kw.toLowerCase() !== exclude.toLowerCase())
    : keywords;

  if (filtered.length === 0) return null;

  return (
    <section className={`bg-muted/50 rounded-lg p-4 ${className}`}>
      <h2 className="text-sm font-bold flex items-center gap-2 mb-3">
        <TrendingUp className="h-4 w-4 text-primary" />
        Trending Topics
      </h2>
      <div className="flex flex-wrap gap-2">
        {filtered.slice(0, 12).map((kw) => (
          <a key={kw} href={`/topic/${encodeURIComponent(kw)}`}>
            <Badge
              variant="secondary"
              className="text-xs hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
            >
              #{kw}
            </Badge>
          </a>
        ))}
      </div>
    </section>
  );
}
