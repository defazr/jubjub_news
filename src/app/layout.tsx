import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const SITE_URL = "https://headlines.fazr.co.kr";
const SITE_NAME = "JubJub 뉴스";
const SITE_DESCRIPTION =
  "국내외 정치, 경제, 사회, 국제, IT/과학, 스포츠 등 주요 뉴스를 실시간으로 한눈에 모아보는 뉴스 큐레이션 서비스";

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
    default: `${SITE_NAME} - 국내외 주요 뉴스를 한눈에`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "뉴스",
    "한국 뉴스",
    "실시간 뉴스",
    "속보",
    "정치",
    "경제",
    "사회",
    "국제",
    "IT",
    "과학",
    "스포츠",
    "문화",
    "오피니언",
    "뉴스 큐레이션",
    "JubJub",
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
    title: `${SITE_NAME} - 국내외 주요 뉴스를 한눈에`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - 국내외 주요 뉴스를 한눈에`,
    description: SITE_DESCRIPTION,
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {},
  category: "news",
  icons: {
    icon: [
      { url: "/icons/favicon.svg", type: "image/svg+xml" },
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
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="canonical" href={SITE_URL} />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="naver-site-verification" content="d19fefda5c8d730ea238a493c59d291eb0a8c6b0" />
        <meta name="google-site-verification" content="" />
      </head>
      <body className="antialiased overflow-x-hidden">
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7976139023602789"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
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
