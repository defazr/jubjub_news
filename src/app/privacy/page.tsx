import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const SITE_URL = "https://headlines.fazr.co.kr";

export const metadata: Metadata = {
  title: "Privacy Policy | Headlines Fazr",
  description: "Privacy Policy for Headlines Fazr - AI Curated Global News",
  alternates: { canonical: `${SITE_URL}/privacy` },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-[800px] mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: March 11, 2026</p>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-lg font-semibold mb-2">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Headlines Fazr (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the website
              at headlines.fazr.co.kr. This Privacy Policy explains how we collect, use, and
              protect your information when you visit our website.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">2. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">
              We do not require user registration or collect personal information directly.
              However, we may automatically collect non-personally identifiable information such as:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
              <li>Browser type and version</li>
              <li>Pages visited and time spent</li>
              <li>Referring website addresses</li>
              <li>Anonymous usage statistics via Google Analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">3. Cookies and Advertising</h2>
            <p className="text-muted-foreground leading-relaxed">
              This website may display advertisements from Google AdSense and other advertising
              partners. These services may use cookies and similar technologies to serve ads
              based on your prior visits to this or other websites. You can opt out of
              personalized advertising by visiting{" "}
              <a href="https://www.google.com/settings/ads" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                Google Ads Settings
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">4. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use the following third-party services:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
              <li><strong>Google Analytics</strong> — for anonymous traffic analysis</li>
              <li><strong>Google AdSense</strong> — for displaying advertisements</li>
              <li><strong>Supabase</strong> — for data storage</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">5. Local Storage</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use your browser&apos;s local storage to save your preferences such as
              bookmarked articles, theme settings, and font size. This data is stored
              only on your device and is never transmitted to our servers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">6. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We do not store any personal data on our servers. Analytics data is managed
              by Google Analytics according to their data retention policies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">7. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. Any changes will be
              posted on this page with an updated revision date.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">8. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us
              at headlines.fazr@gmail.com.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
