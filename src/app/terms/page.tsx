import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const SITE_URL = "https://headlines.fazr.co.kr";

export const metadata: Metadata = {
  title: "Terms of Service | Headlines Fazr",
  description: "Terms of Service for Headlines Fazr - AI Curated Global News",
  alternates: { canonical: `${SITE_URL}/terms` },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-[800px] mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: March 11, 2026</p>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-lg font-semibold mb-2">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using Headlines Fazr (headlines.fazr.co.kr), you accept and
              agree to be bound by these Terms of Service. If you do not agree, please do
              not use this website.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              Headlines Fazr is an AI-curated news aggregation service that collects and
              summarizes global news articles. We do not produce original news content.
              All articles are sourced from third-party publishers and linked back to their
              original sources.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">3. Content and Copyright</h2>
            <p className="text-muted-foreground leading-relaxed">
              News headlines, excerpts, and thumbnails displayed on this site are sourced
              from publicly available news feeds and APIs. Full articles are hosted on
              their respective publishers&apos; websites. All trademarks and copyrights belong
              to their respective owners.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">4. AI-Generated Summaries</h2>
            <p className="text-muted-foreground leading-relaxed">
              Some content on this site includes AI-generated summaries. While we strive
              for accuracy, AI summaries may not perfectly represent the original article.
              We recommend reading the full article from the original source for complete
              and accurate information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">5. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground leading-relaxed">
              This website is provided &quot;as is&quot; without any warranties, expressed or
              implied. We do not guarantee the accuracy, completeness, or timeliness of
              any content displayed on this site.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">6. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              Headlines Fazr shall not be liable for any damages arising from the use or
              inability to use this website, including but not limited to direct, indirect,
              incidental, or consequential damages.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">7. External Links</h2>
            <p className="text-muted-foreground leading-relaxed">
              This site contains links to third-party websites. We are not responsible
              for the content or privacy practices of those sites.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">8. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these terms at any time. Continued use of
              the website after changes constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">9. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms, please contact us at
              headlines.fazr@gmail.com.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
