import { articles } from "@/data/news";

export default function HeadlineSection() {
  const headlines = articles.filter((a) => a.isHeadline);
  const mainHeadline = headlines[0];
  const subHeadline = headlines[1];

  return (
    <section className="border-b-2 border-gray-300 pb-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main headline */}
        <div className="md:col-span-2 border-r-0 md:border-r border-gray-300 pr-0 md:pr-6">
          <span className="text-xs font-bold text-red-700 uppercase tracking-wider">
            {mainHeadline.category}
          </span>
          <h2
            className="text-3xl font-bold text-gray-900 mt-1 mb-3 leading-tight hover:text-blue-900 cursor-pointer"
            style={{ fontFamily: "Georgia, 'Nanum Myeongjo', serif" }}
          >
            {mainHeadline.title}
          </h2>
          <div className="bg-gray-200 w-full h-48 mb-3 flex items-center justify-center text-gray-500 text-sm">
            뉴스 이미지
          </div>
          <p className="text-gray-700 leading-relaxed text-sm">
            {mainHeadline.summary}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {mainHeadline.author} 기자 | {mainHeadline.date}
          </p>
        </div>

        {/* Sub headline + side stories */}
        <div>
          <div className="mb-6">
            <span className="text-xs font-bold text-red-700 uppercase tracking-wider">
              {subHeadline.category}
            </span>
            <h3
              className="text-xl font-bold text-gray-900 mt-1 mb-2 leading-snug hover:text-blue-900 cursor-pointer"
              style={{ fontFamily: "Georgia, 'Nanum Myeongjo', serif" }}
            >
              {subHeadline.title}
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {subHeadline.summary}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {subHeadline.author} 기자 | {subHeadline.date}
            </p>
          </div>

          {/* Side list */}
          <div className="border-t border-gray-300 pt-4">
            <h4 className="text-sm font-bold text-gray-900 mb-3">주요 뉴스</h4>
            <ul className="space-y-2">
              {articles.slice(2, 7).map((article, i) => (
                <li key={article.id} className="flex gap-2 text-sm">
                  <span className="text-red-700 font-bold shrink-0">
                    {i + 1}
                  </span>
                  <a
                    href="#"
                    className="text-gray-800 hover:text-blue-900 line-clamp-1"
                  >
                    {article.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
