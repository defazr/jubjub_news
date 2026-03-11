import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AdSenseScript } from "@/components/AdSenseScript";
import "./globals.css";

const SITE_URL = "https://headlines.fazr.co.kr";
const SITE_NAME = "Headlines Fazr";
const SITE_DESCRIPTION =
  "Headlines Fazr delivers global news curated by AI. Discover trending topics, AI summaries, and the latest worldwide stories.";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a2e" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - AI Curated Global News`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "AI news",
    "global news",
    "AI summary",
    "news curation",
    "AI curated news",
    "world news",
    "technology",
    "business",
    "Headlines Fazr",
    "translated news",
    "news summary",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} - AI Curated Global News`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: `${SITE_URL}/Headlines_Fazr_OG_image.png`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - AI Curated Global News`,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - AI Curated Global News`,
    description: SITE_DESCRIPTION,
    images: [`${SITE_URL}/Headlines_Fazr_OG_image.png`],
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {},
  category: "news",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/icons/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Newsreader:wght@400;500;600;700&family=Noto+Sans+KR:wght@300;400;500;700&display=swap" rel="stylesheet" />
        <link rel="canonical" href={SITE_URL} />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="alternate" type="application/rss+xml" title="Headlines Fazr RSS" href={`${SITE_URL}/rss.xml`} />
        <meta name="naver-site-verification" content="d19fefda5c8d730ea238a493c59d291eb0a8c6b0" />
        <meta name="google-site-verification" content="" />
        {/* 카카오톡 공유용 (OG 태그 기반 + 추가 메타) */}
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
      </head>
      <body className="antialiased overflow-x-hidden">
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <AdSenseScript />
        {/* Google Analytics 4 — lazyOnload to avoid preload warning */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-Z5K4EG4DNE"
          strategy="lazyOnload"
        />
        <Script id="ga4-init" strategy="lazyOnload">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-Z5K4EG4DNE');
        `}</Script>
        <Script id="font-size-init" strategy="beforeInteractive">{`
          try {
            var fs = localStorage.getItem('jubjub_font_size');
            if (fs) document.documentElement.style.setProperty('--jubjub-font-size', fs + 'px');
          } catch(e) {}
        `}</Script>
        <Script id="sw-register" strategy="afterInteractive">{`
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(() => {});
          }
        `}</Script>
      </body>
    </html>
  );
}
