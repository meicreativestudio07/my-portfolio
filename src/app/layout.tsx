import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { SiteFrame } from "@/components/layout/site-frame";

import {
  DEFAULT_SITE_DESCRIPTION,
  DEFAULT_SITE_TITLE,
  getSiteUrl,
} from "@/lib/site-metadata";

import "@fontsource-variable/instrument-sans";
import "@fontsource-variable/source-sans-3/wght-italic.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: DEFAULT_SITE_TITLE,
    template: "%s — Mei",
  },
  description: DEFAULT_SITE_DESCRIPTION,
  openGraph: {
    title: {
      default: DEFAULT_SITE_TITLE,
      template: "%s — Mei",
    },
    description: DEFAULT_SITE_DESCRIPTION,
    siteName: "Mei — Portfolio",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: DEFAULT_SITE_TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: {
      default: DEFAULT_SITE_TITLE,
      template: "%s — Mei",
    },
    description: DEFAULT_SITE_DESCRIPTION,
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#faf6ed",
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

// Adobe Fonts(Gill Sans Nova)。Web Project の Kit ID が未設定のときは何も
// 読み込まない — 見出しの英字は --font-heading の次の候補(端末の Gill Sans
// → Source Sans 3)にそのまま自然にフォールバックする。
const adobeFontsKitId = process.env.NEXT_PUBLIC_ADOBE_FONTS_KIT_ID;

const RootLayout = ({ children }: RootLayoutProps) => (
  <html lang="ja" data-scroll-behavior="smooth">
    {adobeFontsKitId ? (
      <head>
        <link
          rel="stylesheet"
          href={`https://use.typekit.net/${adobeFontsKitId}.css`}
        />
      </head>
    ) : null}
    <body>
      <SiteFrame>{children}</SiteFrame>
    </body>
  </html>
);

export default RootLayout;
