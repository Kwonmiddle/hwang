import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "수달 캐릭터",
  description: "스프라이트 기반 캐릭터",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-slate-900 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
