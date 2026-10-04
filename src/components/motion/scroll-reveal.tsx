"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Site-wide scroll reveal. Any element marked `data-reveal` ("rise", "text"
 * or "zoom") starts hidden and is released once it enters the viewport; the
 * motion itself lives in globals.css. Elements entering together get an
 * increasing `--reveal-step`, so a row of photos appears one after another.
 *
 * The inline script in app/layout.tsx sets `data-reveal-state="pending"` before
 * first paint so nothing flashes; this component switches it to "active". If
 * this never runs, a CSS failsafe reveals everything after a short delay.
 */

// Caps the stagger so a long batch never leaves the last item waiting.
const MAX_REVEAL_STEP = 6;

const REVEAL_SELECTOR = "[data-reveal]:not([data-revealed])";

export const REVEAL_BOOT_SCRIPT = `try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.dataset.revealState="pending"}catch(e){}`;

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

    const observer = new IntersectionObserver(
      (entries) => {
        let step = 0;
        for (const entry of entries) {
          const target = entry.target;
          if (!entry.isIntersecting || !(target instanceof HTMLElement)) {
            continue;
          }
          target.style.setProperty(
            "--reveal-step",
            String(Math.min(step, MAX_REVEAL_STEP)),
          );
          target.dataset.revealed = "true";
          observer.unobserve(target);
          step += 1;
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );

    for (const element of document.querySelectorAll(REVEAL_SELECTOR)) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [pathname]);

  return null;
};
