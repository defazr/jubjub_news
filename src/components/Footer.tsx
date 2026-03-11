import { Separator } from "@/components/ui/separator";
import { CATEGORIES } from "@/lib/categories";

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-6">
      <div className="max-w-[1200px] mx-auto px-4 py-8 md:py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <a href="/">
              <span className="font-headline text-2xl tracking-tight">Headlines Fazr</span>
            </a>
            <p className="text-base text-muted-foreground leading-relaxed mt-2">
              Latest global news curated by AI with quick summaries.
            </p>
          </div>
          <div>
            <h5 className="text-base font-bold text-foreground mb-3">Sections</h5>
            <ul className="text-base space-y-2">
              {CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <a href={`/category/${cat.slug}`} className="text-muted-foreground hover:text-primary transition-colors">
                    {cat.name}
                  </a>
                </li>
              ))}
              <li>
                <a href="/world" className="text-primary hover:underline transition-colors font-medium">
                  World News
                </a>
              </li>
              <li>
                <a href="/ai" className="text-primary hover:underline transition-colors font-medium">
                  AI News
                </a>
              </li>
              <li>
                <a href="/bookmarks" className="text-muted-foreground hover:text-primary transition-colors">
                  Saved
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="text-base font-bold text-foreground mb-3">Legal</h5>
            <ul className="text-base space-y-2">
              <li><a href="/advertise" className="text-muted-foreground hover:text-primary transition-colors">Advertise</a></li>
              <li><a href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <Separator className="mb-5" />
        <p className="text-sm text-muted-foreground/60 text-center">
          &copy; 2026 Headlines Fazr. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
