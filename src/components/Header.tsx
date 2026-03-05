"use client";

import { useState } from "react";

const categories = [
  "정치", "경제", "사회", "국제", "문화", "IT/과학", "스포츠", "오피니언",
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentDate] = useState(() => {
    const now = new Date();
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    return `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 (${days[now.getDay()]})`;
  });

  return (
    <header className="border-b-2 border-gray-900">
      {/* Top bar */}
      <div className="bg-gray-100 border-b border-gray-300">
        <div className="max-w-[1200px] mx-auto px-4 py-1.5 flex justify-between items-center text-xs text-gray-600">
          <span>{currentDate}</span>
          <div className="flex gap-3">
            <a href="#" className="hover:text-gray-900">로그인</a>
            <a href="#" className="hover:text-gray-900">회원가입</a>
            <a href="#" className="hidden sm:inline hover:text-gray-900">MY뉴스</a>
          </div>
        </div>
      </div>

      {/* Logo */}
      <div className="max-w-[1200px] mx-auto px-4 py-4 md:py-6 text-center">
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-gray-900" style={{ fontFamily: "Georgia, 'Nanum Myeongjo', serif" }}>
          JubJub 뉴스
        </h1>
        <p className="text-xs md:text-sm text-gray-500 mt-1">신뢰와 정확으로 전하는 뉴스</p>
      </div>

      {/* Navigation */}
      <nav className="bg-gray-900 text-white relative">
        <div className="max-w-[1200px] mx-auto px-4">
          {/* Desktop nav */}
          <ul className="hidden md:flex justify-center">
            <li>
              <a href="#" className="block px-5 py-3 text-sm font-medium hover:bg-gray-700 transition-colors">
                홈
              </a>
            </li>
            {categories.map((cat) => (
              <li key={cat}>
                <a href="#" className="block px-5 py-3 text-sm font-medium hover:bg-gray-700 transition-colors">
                  {cat}
                </a>
              </li>
            ))}
          </ul>

          {/* Mobile nav bar */}
          <div className="flex md:hidden items-center justify-between py-2.5">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 text-sm font-medium px-2 py-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
              메뉴
            </button>
            <a href="#" className="text-sm font-medium px-2 py-1">홈</a>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="md:hidden bg-gray-800 border-t border-gray-700">
            <ul className="max-w-[1200px] mx-auto px-4 py-2">
              {categories.map((cat) => (
                <li key={cat}>
                  <a
                    href="#"
                    className="block px-3 py-2.5 text-sm font-medium hover:bg-gray-700 rounded transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    {cat}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
}
