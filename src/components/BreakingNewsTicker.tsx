"use client";

interface Props {
  items: string[];
}

export default function BreakingNewsTicker({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <div className="bg-red-700 text-white overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4 flex items-center">
        <span className="bg-red-900 px-3 py-2 text-xs font-bold shrink-0">
          속보
        </span>
        <div className="overflow-hidden py-2 pl-4">
          <div className="animate-marquee whitespace-nowrap">
            {items.map((news, i) => (
              <span key={i} className="text-sm mx-8">
                {news}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
