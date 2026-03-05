"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function ArticleRedirectContent() {
  const params = useSearchParams();
  const url = params.get("url") || "";
  const title = params.get("title") || "뉴스 기사";
  const source = params.get("source") || "";
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!url) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = url;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [url]);

  if (!url) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow text-center">
          <p className="text-gray-600">잘못된 접근입니다.</p>
          <a href="/" className="text-blue-600 hover:underline mt-4 inline-block">
            홈으로 돌아가기
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gray-900 text-white">
        <div className="max-w-[800px] mx-auto px-4 py-3 flex items-center justify-between">
          <a
            href="/"
            className="text-lg font-bold"
            style={{ fontFamily: "Georgia, 'Nanum Myeongjo', serif" }}
          >
            JubJub 뉴스
          </a>
          <a href="/" className="text-sm text-gray-300 hover:text-white">
            ← 홈으로
          </a>
        </div>
      </header>

      <main className="max-w-[800px] mx-auto px-4 py-8">
        {/* Ad space - top */}
        <div className="bg-white border border-dashed border-gray-300 rounded-lg p-6 mb-6 text-center">
          <p className="text-xs text-gray-400 mb-2">광고</p>
          {/* Google AdSense 코드가 여기에 들어갑니다 */}
          <div className="h-[90px] bg-gray-50 flex items-center justify-center text-gray-300 text-sm">
            AD SPACE (728×90)
          </div>
        </div>

        {/* Article preview card */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">
            외부 기사로 이동합니다
          </p>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 leading-tight">
            {decodeURIComponent(title)}
          </h1>
          {source && (
            <p className="text-sm text-gray-500 mb-4">
              출처: <span className="font-medium text-gray-700">{decodeURIComponent(source)}</span>
            </p>
          )}

          <div className="border-t border-gray-200 pt-4 flex flex-col sm:flex-row items-center gap-4">
            <a
              href={url}
              className="inline-block bg-red-700 hover:bg-red-800 text-white font-bold py-3 px-8 rounded transition-colors text-center"
            >
              기사 바로가기
            </a>
            <span className="text-sm text-gray-400">
              {countdown > 0
                ? `${countdown}초 후 자동으로 이동합니다`
                : "이동 중..."}
            </span>
          </div>
        </div>

        {/* Ad space - bottom */}
        <div className="bg-white border border-dashed border-gray-300 rounded-lg p-6 mb-6 text-center">
          <p className="text-xs text-gray-400 mb-2">광고</p>
          <div className="h-[250px] bg-gray-50 flex items-center justify-center text-gray-300 text-sm">
            AD SPACE (300×250)
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center">
          <a
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            JubJub 뉴스 홈으로 돌아가기
          </a>
        </div>
      </main>

      <footer className="bg-gray-900 text-gray-500 text-xs text-center py-4 mt-8">
        &copy; 2026 JubJub 뉴스. All rights reserved.
      </footer>
    </div>
  );
}

export default function ArticlePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-red-700 rounded-full animate-spin" />
        </div>
      }
    >
      <ArticleRedirectContent />
    </Suspense>
  );
}
