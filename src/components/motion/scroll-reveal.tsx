"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Site-wide scroll reveal. Any element marked `data-reveal` ("rise", "text"
 * or "zoom") starts hidden and is released once it enters the viewport; the
 * motion itself lives in globals.css.
 *
 * Elements entering together arrive top to bottom: each gets a `--reveal-delay`
 * a beat after the one above it, overlapping rather than waiting for it to
 * finish. The beat depends on what came just before (see revealGap).
 *
 * The inline script in app/layout.tsx sets `data-reveal-state="pending"` before
 * first paint so nothing flashes; this component switches it to "active". If
 * this never runs, a CSS failsafe reveals everything after a short delay.
 */

// Caps the sequence so a long batch never leaves the last item waiting.
const MAX_REVEAL_DELAY_MS = 1600;

const REVEAL_SELECTOR = "[data-reveal]:not([data-revealed])";

export const REVEAL_BOOT_SCRIPT = `try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.dataset.revealState="pending"}catch(e){}`;

// Reads a time token (e.g. "160ms" or "0.16s") from :root, in milliseconds.
const readTimeToken = (name: string): number => {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  const amount = Number.parseFloat(value);
  if (Number.isNaN(amount)) return 0;
  return value.endsWith("ms") ? amount : amount * 1000;
};

type RevealTimings = Readonly<{
  stagger: number;
  textAfterPhoto: number;
  photoAfterText: number;
}>;

/**
 * The wait between one arrival and the next.
 * - copy after a photo waits longer, so copy follows its image;
 * - a photo after copy waits a little, so headings lead the work;
 * - otherwise the plain stagger (photo after photo, copy after copy).
 */
const revealGap = (
  previous: string | undefined,
  current: string | undefined,
  timings: RevealTimings,
): number => {
  if (previous === undefined) return 0;
  const previousIsText = previous === "text";
  const currentIsText = current === "text";
  if (!previousIsText && currentIsText) {
    return timings.stagger + timings.textAfterPhoto;
  }
  if (previousIsText && !currentIsText) return timings.photoAfterText;
  return timings.stagger;
};

export const ScrollReveal = () => {
  const pathname = usePathname();

  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname is the trigger; each route brings new elements to observe
  useEffect(() => {
    const root = document.documentElement;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      delete root.dataset.revealState;
      return;
    }

    root.dataset.revealState = "active";

    const timings: RevealTimings = {
      stagger: readTimeToken("--motion-reveal-stagger"),
      textAfterPhoto: readTimeToken("--motion-reveal-text-delay"),
      photoAfterText: readTimeToken("--motion-reveal-photo-after-text"),
    };

    const observer = new IntersectionObserver(
      (entries) => {
        // Entries arrive in observation order, which is document order.
        let delay = 0;
        let previousKind: string | undefined;
        for (const entry of entries) {
          const target = entry.target;
          if (!entry.isIntersecting || !(target instanceof HTMLElement)) {
            continue;
          }
          const kind = target.dataset.reveal;
          delay = Math.min(
            delay + revealGap(previousKind, kind, timings),
            MAX_REVEAL_DELAY_MS,
          );
          target.style.setProperty("--reveal-delay", `${delay}ms`);
          target.dataset.revealed = "true";
          observer.unobserve(target);
          previousKind = kind;
        }
      },
      // Anything on screen at all starts arriving, so the first view never
      // shows a blank sliver at the bottom edge.
      { rootMargin: "0px" },
    );

    for (const element of document.querySelectorAll(REVEAL_SELECTOR)) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [pathname]);

  return null;
};
