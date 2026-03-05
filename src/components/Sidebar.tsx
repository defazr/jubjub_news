import { type ApiArticle } from "@/lib/api";

interface Props {
  articles: ApiArticle[];
}

export default function Sidebar({ articles }: Props) {
  return (
    <aside className="space-y-6">
      {/* Most read */}
      <div className="border-t-2 border-red-700 pt-3">
        <h3 className="text-lg font-bold text-gray-900 mb-3">많이 본 뉴스</h3>
        <ol className="space-y-2">
          {articles.slice(0, 8).map((article, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span
                className={`text-lg font-bold shrink-0 ${i < 3 ? "text-red-700" : "text-gray-400"}`}
              >
                {i + 1}
              </span>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-800 hover:text-blue-900 leading-snug"
              >
                {article.title}
              </a>
            </li>
          ))}
        </ol>
      </div>

      {/* Publisher sources */}
      <div className="border-t-2 border-gray-900 pt-3">
        <h3 className="text-lg font-bold text-gray-900 mb-3">뉴스 출처</h3>
        <ul className="space-y-2">
          {[...new Set(articles.map((a) => a.publisher.name).filter(Boolean))]
            .slice(0, 6)
            .map((name, i) => (
              <li key={i} className="text-sm text-gray-600">
                {name}
              </li>
            ))}
        </ul>
      </div>
    </aside>
  );
}
