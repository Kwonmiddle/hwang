import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "황경산 | 정의당 서대문구의원 후보 · 마선거구",
  description:
    "서대문 마선거구 구의원 후보 황경산 — 내란세력 청산, 1인가구·생태·교통·성평등 공약",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orizon-design/paperlogy@1.0/dist/Paperlogy.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/pretendard@latest/dist/web/static/pretendard.css"
        />
      </head>
      <body className="m-0 antialiased">{children}</body>
    </html>
  );
}
