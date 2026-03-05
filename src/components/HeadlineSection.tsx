import { type ApiArticle, formatDate } from "@/lib/api";
import { articleLink } from "@/lib/link";

interface Props {
  articles: ApiArticle[];
}

export default function HeadlineSection({ articles }: Props) {
  if (articles.length === 0) return null;

  const mainHeadline = articles[0];
  const subHeadline = articles[1];

  return (
    <section className="border-b-2 border-gray-300 pb-4 md:pb-6 mb-4 md:mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Main headline */}
        <div className="md:col-span-2 border-b md:border-b-0 md:border-r border-gray-300 pb-4 md:pb-0 md:pr-6">
          <span className="text-xs font-bold text-red-700 uppercase tracking-wider">
            {mainHeadline.publisher.name || "뉴스"}
          </span>
          <h2
            className="text-xl md:text-3xl font-bold text-gray-900 mt-1 mb-3 leading-tight"
            style={{ fontFamily: "Georgia, 'Nanum Myeongjo', serif" }}
          >
            <a
              href={articleLink(mainHeadline.url, mainHeadline.title, mainHeadline.publisher.name)}
              className="hover:text-blue-900"
            >
              {mainHeadline.title}
            </a>
          </h2>
          {mainHeadline.thumbnail ? (
            <img
              src={mainHeadline.thumbnail}
              alt={mainHeadline.title}
              className="w-full h-40 md:h-48 object-cover mb-3 rounded"
            />
          ) : (
            <div className="bg-gray-200 w-full h-40 md:h-48 mb-3 flex items-center justify-center text-gray-500 text-sm rounded">
              뉴스 이미지
            </div>
          )}
          <p className="text-gray-700 leading-relaxed text-sm line-clamp-3 md:line-clamp-none">
            {mainHeadline.excerpt}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {mainHeadline.authors?.[0] || mainHeadline.publisher.name} |{" "}
            {formatDate(mainHeadline.date)}
          </p>
        </div>

        {/* Sub headline + side stories */}
        <div>
          {subHeadline && (
            <div className="mb-4 md:mb-6">
              <span className="text-xs font-bold text-red-700 uppercase tracking-wider">
                {subHeadline.publisher.name || "뉴스"}
              </span>
              <h3
                className="text-lg md:text-xl font-bold text-gray-900 mt-1 mb-2 leading-snug"
                style={{ fontFamily: "Georgia, 'Nanum Myeongjo', serif" }}
              >
                <a
                  href={articleLink(subHeadline.url, subHeadline.title, subHeadline.publisher.name)}
                  className="hover:text-blue-900"
                >
                  {subHeadline.title}
                </a>
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                {subHeadline.excerpt}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {subHeadline.authors?.[0] || subHeadline.publisher.name} |{" "}
                {formatDate(subHeadline.date)}
              </p>
            </div>
          )}

          {/* Side list */}
          <div className="border-t border-gray-300 pt-3 md:pt-4">
            <h4 className="text-sm font-bold text-gray-900 mb-3">주요 뉴스</h4>
            <ul className="space-y-2">
              {articles.slice(2, 7).map((article, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="text-red-700 font-bold shrink-0">
                    {i + 1}
                  </span>
                  <a
                    href={articleLink(article.url, article.title, article.publisher.name)}
                    className="text-gray-800 hover:text-blue-900 line-clamp-2 md:line-clamp-1"
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
