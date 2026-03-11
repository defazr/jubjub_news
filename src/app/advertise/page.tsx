import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mail } from "lucide-react";

const SITE_URL = "https://headlines.fazr.co.kr";

export const metadata: Metadata = {
  title: "Advertise | Headlines Fazr",
  description: "Advertise on Headlines Fazr - reach a global audience interested in AI, technology, and world news.",
  alternates: { canonical: `${SITE_URL}/advertise` },
};

export default function AdvertisePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-[800px] mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Advertise with Us</h1>

        <div className="space-y-6">
          <p className="text-muted-foreground leading-relaxed">
            Headlines Fazr is an AI-curated global news platform reaching readers interested
            in technology, AI, business, and world affairs.
          </p>

          <section className="bg-muted/50 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-3">Ad Placements Available</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span><strong>Homepage</strong> — top and mid-content banner ads</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span><strong>Article pages</strong> — in-article and post-article placements</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span><strong>Topic pages</strong> — contextual ads alongside trending topics</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">Get in Touch</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              For advertising inquiries, sponsorship opportunities, or partnership proposals,
              please contact us:
            </p>
            <a
              href="mailto:headlines.fazr@gmail.com"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              <Mail className="h-4 w-4" />
              headlines.fazr@gmail.com
            </a>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
