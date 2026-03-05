import { articles } from "@/data/news";

export default function Sidebar() {
  const opinionArticles = articles.filter((a) => a.category === "오피니언");
  const recentArticles = [...articles]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return (
    <aside className="space-y-6">
      {/* Opinion section */}
      <div className="border-t-2 border-gray-900 pt-3">
        <h3 className="text-lg font-bold text-gray-900 mb-3">오피니언</h3>
        {opinionArticles.map((article) => (
          <div key={article.id} className="mb-4">
            <a
              href="#"
              className="text-sm font-medium text-gray-800 hover:text-blue-900 leading-snug block"
            >
              {article.title}
            </a>
            <p className="text-xs text-gray-500 mt-1">{article.author}</p>
          </div>
        ))}
      </div>

      {/* Most read */}
      <div className="border-t-2 border-red-700 pt-3">
        <h3 className="text-lg font-bold text-gray-900 mb-3">많이 본 뉴스</h3>
        <ol className="space-y-2">
          {recentArticles.map((article, i) => (
            <li key={article.id} className="flex gap-3 items-start">
              <span
                className={`text-lg font-bold shrink-0 ${i < 3 ? "text-red-700" : "text-gray-400"}`}
              >
                {i + 1}
              </span>
              <a
                href="#"
                className="text-sm text-gray-800 hover:text-blue-900 leading-snug"
              >
                {article.title}
              </a>
            </li>
          ))}
        </ol>
      </div>

      {/* Weather widget placeholder */}
      <div className="border border-gray-300 p-4 bg-gray-50">
        <h3 className="text-sm font-bold text-gray-900 mb-2">오늘의 날씨</h3>
        <div className="text-center py-4">
          <p className="text-3xl mb-1">12°C</p>
          <p className="text-sm text-gray-600">서울 | 흐림</p>
          <p className="text-xs text-gray-500 mt-1">미세먼지: 나쁨</p>
        </div>
      </div>
    </aside>
  );
}
