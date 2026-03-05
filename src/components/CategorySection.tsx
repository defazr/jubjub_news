import { articles } from "@/data/news";

export default function CategorySection() {
  const categoryGroups = articles.reduce(
    (acc, article) => {
      if (!acc[article.category]) acc[article.category] = [];
      acc[article.category].push(article);
      return acc;
    },
    {} as Record<string, typeof articles>
  );

  const displayCategories = ["경제", "사회", "IT/과학", "스포츠"];

  return (
    <section className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayCategories.map((cat) => (
          <div key={cat} className="border-t-2 border-gray-900 pt-3">
            <h3 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-300">
              {cat}
            </h3>
            <ul className="space-y-3">
              {(categoryGroups[cat] || []).map((article) => (
                <li
                  key={article.id}
                  className="border-b border-gray-200 pb-3 last:border-0"
                >
                  <a
                    href="#"
                    className="text-sm font-medium text-gray-800 hover:text-blue-900 block leading-snug"
                  >
                    {article.title}
                  </a>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {article.summary}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
