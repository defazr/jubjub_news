"use client";

import { useState } from "react";

const categories = [
  "정치", "경제", "사회", "국제", "문화", "IT/과학", "스포츠", "오피니언",
];

export default function Header() {
  const [currentDate] = useState(() => {
    const now = new Date();
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    return `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 (${days[now.getDay()]})`;
  });

  return (
    <header className="border-b-2 border-gray-900">
      {/* Top bar */}
      <div className="bg-gray-100 border-b border-gray-300">
        <div className="max-w-[1200px] mx-auto px-4 py-1 flex justify-between items-center text-xs text-gray-600">
          <span>{currentDate}</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-900">로그인</a>
            <a href="#" className="hover:text-gray-900">회원가입</a>
            <a href="#" className="hover:text-gray-900">MY뉴스</a>
          </div>
        </div>
      </div>

      {/* Logo */}
      <div className="max-w-[1200px] mx-auto px-4 py-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900" style={{ fontFamily: "Georgia, 'Nanum Myeongjo', serif" }}>
          JubJub 뉴스
        </h1>
        <p className="text-sm text-gray-500 mt-1">신뢰와 정확으로 전하는 뉴스</p>
      </div>

      {/* Navigation */}
      <nav className="bg-gray-900 text-white">
        <div className="max-w-[1200px] mx-auto px-4">
          <ul className="flex justify-center">
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
        </div>
      </nav>
    </header>
  );
}
