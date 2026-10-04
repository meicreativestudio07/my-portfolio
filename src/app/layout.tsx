import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { SiteFrame } from "@/components/layout/site-frame";
import {
  REVEAL_BOOT_SCRIPT,
  ScrollReveal,
} from "@/components/motion/scroll-reveal";

import {
  DEFAULT_SITE_DESCRIPTION,
  DEFAULT_SITE_TITLE,
  getSiteUrl,
} from "@/lib/site-metadata";

import "@fontsource-variable/instrument-sans";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: DEFAULT_SITE_TITLE,
    template: "%s — Être",
  },
  description: DEFAULT_SITE_DESCRIPTION,
  openGraph: {
    title: {
      default: DEFAULT_SITE_TITLE,
      template: "%s — Être",
    },
    description: DEFAULT_SITE_DESCRIPTION,
    siteName: "Être",
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
      template: "%s — Être",
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
  themeColor: "#f1f1f1",
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

const RootLayout = ({ children }: RootLayoutProps) => (
  // suppressHydrationWarning: the boot script below sets data-reveal-state on
  // <html> before React hydrates.
  <html lang="ja" data-scroll-behavior="smooth" suppressHydrationWarning>
    <head>
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static boot script, no user input
        dangerouslySetInnerHTML={{ __html: REVEAL_BOOT_SCRIPT }}
      />
    </head>
    <body>
      <SiteFrame>{children}</SiteFrame>
      <ScrollReveal />
    </body>
  </html>
);

export default RootLayout;
