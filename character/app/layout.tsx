import type { Metadata } from "next";
import "./globals.css";

const siteTitle = "서대문 수달이를 키워주세요";
const siteDescription =
  "서대문에서 해결 할 4가지 문제! 황경산 구의원 후보가 시민들과 함께 해결하겠습니다!";

/** OG 이미지 교체 시 숫자만 올리면 카카오·SNS 이미지 캐시를 우회할 수 있습니다. */
const OG_IMAGE_VERSION = "20260516";
const OG_IMAGE_PATH = `/data_og.jpg?v=${OG_IMAGE_VERSION}`;
const OG_IMAGE_WIDTH = 1200;
const OG_IMAGE_HEIGHT = 630;

/** OG·canonical 절대 URL. 미설정 시 배포 환경별 추정(카카오 등은 절대 URL 필수). */
function metadataBase(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return new URL(explicit);

  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProd) {
    const host = vercelProd.replace(/^https?:\/\//, "").replace(/\/$/, "");
    return new URL(`https://${host}`);
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, "").replace(/\/$/, "");
    return new URL(`https://${host}`);
  }

  if (process.env.NODE_ENV !== "production") {
    return new URL("http://localhost:3000");
  }

  return new URL("https://hwangkyungsan.com");
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
    url: "/",
    images: [
      {
        url: OG_IMAGE_PATH,
        width: OG_IMAGE_WIDTH,
        height: OG_IMAGE_HEIGHT,
        alt: siteTitle,
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: OG_IMAGE_PATH,
        width: OG_IMAGE_WIDTH,
        height: OG_IMAGE_HEIGHT,
        alt: siteTitle,
      },
    ],
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
