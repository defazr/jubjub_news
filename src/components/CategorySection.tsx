import { type ApiArticle, formatDate } from "@/lib/api";
import { articleLink } from "@/lib/link";

interface Props {
  categoryData: Record<string, ApiArticle[]>;
}

export default function CategorySection({ categoryData }: Props) {
  const displayCategories = Object.keys(categoryData);

  return (
    <section className="mb-6 md:mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {displayCategories.map((cat) => {
          const articles = categoryData[cat] || [];
          const featured = articles[0];
          const rest = articles.slice(1);

          return (
            <div key={cat} id={`category-${cat}`} className="border-t-2 border-gray-900 pt-3 scroll-mt-16">
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-300">
                {cat}
              </h3>

              {featured && (
                <a
                  href={articleLink(featured.url, featured.title, featured.publisher.name)}
                  className="block mb-3 group"
                >
                  {featured.thumbnail && (
                    <div className="relative w-full aspect-video mb-2 overflow-hidden bg-gray-100">
                      <img
                        src={featured.thumbnail}
                        alt={featured.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <span className="text-sm font-bold text-gray-900 group-hover:text-blue-900 leading-snug block">
                    {featured.title}
                  </span>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {featured.excerpt}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {featured.publisher.name} | {formatDate(featured.date)}
                  </p>
                </a>
              )}

              <ul className="space-y-3">
                {rest.map((article, i) => (
                  <li
                    key={i}
                    className="border-b border-gray-200 pb-3 last:border-0"
                  >
                    <a
                      href={articleLink(article.url, article.title, article.publisher.name)}
                      className="text-sm font-medium text-gray-800 hover:text-blue-900 block leading-snug"
                    >
                      {article.title}
                    </a>
                    <p className="text-xs text-gray-400 mt-1">
                      {article.publisher.name} | {formatDate(article.date)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
