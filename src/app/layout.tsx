import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "JubJub 뉴스 - 국내외 주요 뉴스를 한눈에",
  description: "국내외 주요 뉴스를 한눈에 모아 보여드리는 JubJub 뉴스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased overflow-x-hidden">{children}</body>
    </html>
  );
}
