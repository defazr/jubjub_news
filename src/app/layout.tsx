import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "JubJub 뉴스 - 신뢰와 정확으로 전하는 뉴스",
  description: "대한민국을 대표하는 종합 뉴스 미디어 JubJub 뉴스",
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
