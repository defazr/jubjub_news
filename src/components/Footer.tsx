export default function Footer() {
  const sections = ["정치", "경제", "사회", "국제", "문화", "IT/과학", "스포츠", "오피니언"];

  return (
    <footer className="bg-gray-900 text-gray-400 mt-4">
      <div className="max-w-[1200px] mx-auto px-4 py-6 md:py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 mb-6 md:mb-8">
          <div className="col-span-2 md:col-span-1">
            <h4
              className="text-white text-lg font-bold mb-2 md:mb-3"
              style={{ fontFamily: "Georgia, 'Nanum Myeongjo', serif" }}
            >
              JubJub 뉴스
            </h4>
            <p className="text-sm leading-relaxed">
              국내외 주요 뉴스를 한눈에 모아 보여드립니다.
            </p>
          </div>
          <div>
            <h5 className="text-white text-sm font-bold mb-2 md:mb-3">섹션</h5>
            <ul className="text-sm space-y-1">
              {sections.map((s) => (
                <li key={s}>
                  <a href={`#category-${s}`} className="hover:text-white">
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="text-white text-sm font-bold mb-2 md:mb-3">고객센터</h5>
            <ul className="text-sm space-y-1">
              <li><a href="#" className="hover:text-white">광고 문의</a></li>
              <li><a href="#" className="hover:text-white">제보하기</a></li>
              <li><a href="#" className="hover:text-white">이용약관</a></li>
              <li><a href="#" className="hover:text-white">개인정보처리방침</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-4 text-xs text-center">
          <p>&copy; 2026 JubJub 뉴스. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
