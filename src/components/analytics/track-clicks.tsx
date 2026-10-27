"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Sends a GA4 event for any link marked `data-track="<event name>"`, with
 * `data-track-position` telling apart several links for the same action.
 * One delegated listener keeps the marked links in Server Components.
 */
export const TrackClicks = () => {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLElement>("[data-track]");
      const name = link?.dataset.track;
      if (!link || !name) return;

      window.gtag?.("event", name, {
        position: link.dataset.trackPosition,
        page_path: window.location.pathname,
      });
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
};
