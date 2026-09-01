import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteFrame } from "@/components/layout/site-frame";

import "@fontsource-variable/instrument-sans";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Mei — Portfolio",
    template: "%s — Mei",
  },
  description: "Selected creative work by Mei.",
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

const RootLayout = ({ children }: RootLayoutProps) => (
  <html lang="ja" data-scroll-behavior="smooth">
    <body>
      <SiteFrame>{children}</SiteFrame>
    </body>
  </html>
);

export default RootLayout;
