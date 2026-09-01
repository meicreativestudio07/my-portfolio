"use client";

import { createContext, useContext } from "react";

export type SiteNavigateOptions = Readonly<{
  skipExit?: boolean;
}>;

export type SiteNavigate = (
  href: string,
  options?: SiteNavigateOptions,
) => void;

export type SiteNavigation = Readonly<{
  hideHeader: () => void;
  markPageReady: () => void;
  navigate: SiteNavigate;
}>;

export const SiteNavigationContext = createContext<SiteNavigation | null>(null);

export const useSiteNavigation = () => useContext(SiteNavigationContext);
