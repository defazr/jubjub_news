export default function Logo({ size = "lg" }: { size?: "lg" | "md" | "sm" }) {
  if (size === "sm") {
    return (
      <span className="inline-flex items-center gap-1">
        <span className="relative flex items-center justify-center w-5 h-5 bg-red-600 rounded-full shadow-sm">
          <span className="text-[6px] font-bold text-white tracking-wider">LIVE</span>
          <span className="absolute inset-0 rounded-full border border-red-400/40 animate-pulse" />
        </span>
        <span className="text-base font-black bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
          줍줍뉴스
        </span>
      </span>
    );
  }

  const textSize = size === "lg" ? "text-3xl md:text-4xl" : "text-xl";
  const badgeSize = size === "lg" ? "w-10 h-10 md:w-12 md:h-12" : "w-7 h-7";
  const badgeText = size === "lg" ? "text-[10px] md:text-xs" : "text-[7px]";
  const ringSize = size === "lg" ? "w-14 h-14 md:w-16 md:h-16" : "w-9 h-9";
  const signalSize = size === "lg" ? "w-10 h-10 md:w-12 md:h-12" : "w-6 h-6";

  return (
    <span className="inline-flex items-center gap-1.5 md:gap-2.5 select-none">
      {/* LIVE badge with rings */}
      <span className="relative flex items-center justify-center shrink-0">
        <span className={`absolute ${ringSize} rounded-full border border-red-300/30`} />
        <span className={`absolute rounded-full border border-red-300/20`} style={{ width: "120%", height: "120%" }} />
        <span className={`relative flex items-center justify-center ${badgeSize} bg-gradient-to-b from-red-500 to-red-700 rounded-full shadow-lg`}>
          <span className={`${badgeText} font-bold text-white tracking-wider`}>LIVE</span>
        </span>
      </span>

      {/* 줍줍뉴스 text */}
      <span className={`${textSize} font-black bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 bg-clip-text text-transparent tracking-tight leading-none`}>
        줍줍뉴스
      </span>

      {/* Signal icon */}
      <span className={`relative ${signalSize} shrink-0`}>
        <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
          <path d="M6 32 Q20 2 34 32" stroke="url(#sig)" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          <path d="M11 30 Q20 10 29 30" stroke="url(#sig)" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M15 28 Q20 16 25 28" stroke="url(#sig)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <circle cx="20" cy="30" r="3" fill="#dc2626" />
          <defs>
            <linearGradient id="sig" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
      </span>
    </span>
  );
}
