import type { Metadata } from "next";
import "./globals.css";

const siteTitle = "서대문 수달이를 키워주세요";
const siteDescription =
  "서대문에서 해결 할 4가지 문제! 황경산 구의원 후보가 시민들과 함께 해결하겠습니다!";

function metadataBase(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return new URL(explicit);
  if (process.env.VERCEL_URL) return new URL(`https://${process.env.VERCEL_URL}`);
  return new URL("http://localhost:3000");
}

export const metadata: Metadata = {
  metadataBase: metadataBase(),
  title: siteTitle,
  description: siteDescription,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    type: "website",
    locale: "ko_KR",
    images: [
      {
        url: "/data_og.jpg",
        alt: siteTitle,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/data_og.jpg"],
  },
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
