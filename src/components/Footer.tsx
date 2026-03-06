import { Separator } from "@/components/ui/separator";
import { CATEGORIES } from "@/lib/categories";

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-6">
      <div className="max-w-[1200px] mx-auto px-4 py-8 md:py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <a href="/">
              <img src="/logo.png" alt="실시간 헤드라인 뉴스" className="h-10 mb-2" />
            </a>
            <p className="text-sm text-muted-foreground leading-relaxed">
              국내외 주요 뉴스를 한눈에 모아 보여드립니다.
            </p>
          </div>
          <div>
            <h5 className="text-sm font-bold text-foreground mb-3">섹션</h5>
            <ul className="text-sm space-y-1.5">
              {CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <a href={`/category/${cat.slug}`} className="text-muted-foreground hover:text-primary transition-colors">
                    {cat.name}
                  </a>
                </li>
              ))}
              <li>
                <a href="/world" className="text-primary hover:underline transition-colors font-medium">
                  해외 뉴스
                </a>
              </li>
              <li>
                <a href="/bookmarks" className="text-muted-foreground hover:text-primary transition-colors">
                  스크랩
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="text-sm font-bold text-foreground mb-3">고객센터</h5>
            <ul className="text-sm space-y-1.5">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">광고 문의</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">제보하기</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">이용약관</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">개인정보처리방침</a></li>
            </ul>
          </div>
        </div>
        <Separator className="mb-5" />
        <p className="text-xs text-muted-foreground/60 text-center">
          &copy; 2026 줍줍뉴스. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
