"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { BotanicalMark } from "@/features/intro/components/botanical-mark";
import type { IntroImage } from "@/features/intro/types/intro";

type PortfolioIntroProps = Readonly<{
  portrait: IntroImage;
}>;

type IntroPhase = "loading" | "portrait" | "name" | "exit" | "done";

/** Offset and scale that carry the intro's mark onto the page's own mark. */
type Handoff = Readonly<{ x: number; y: number; scale: number }>;

const AUTO_NAME_DELAY = 700;
const AUTO_EXIT_DELAY = 4000;
const SKIP_EXIT_DELAY = 450;
// Ends the intro even if the hand-off animation never reports completion.
const EXIT_FAILSAFE_DELAY = 2000;

// The page under the intro marks the Être logo it wants the intro's mark to
// land on. Without one, the mark simply fades with the rest of the intro.
const HANDOFF_TARGET_SELECTOR = "[data-intro-handoff] img";

const handoffTransition = {
  duration: 1.1,
  ease: [0.65, 0, 0.35, 1] as const,
};

const measureHandoff = (mark: HTMLElement | null): Handoff | null => {
  const target = document.querySelector(HANDOFF_TARGET_SELECTOR);
  if (!mark || !target) return null;

  const from = mark.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  if (from.height === 0 || to.height === 0) return null;

  return {
    x: to.left + to.width / 2 - (from.left + from.width / 2),
    y: to.top + to.height / 2 - (from.top + from.height / 2),
    scale: to.height / from.height,
  };
};

export const PortfolioIntro = ({ portrait }: PortfolioIntroProps) => {
  const shouldReduceMotion = useReducedMotion();
  const timers = useRef<number[]>([]);
  const hasStarted = useRef(false);
  const markRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<IntroPhase>("loading");
  const [handoff, setHandoff] = useState<Handoff | null>(null);

  const clearTimers = useCallback(() => {
    for (const timer of timers.current) window.clearTimeout(timer);
    timers.current = [];
  }, []);

  const schedule = useCallback((action: () => void, delay: number) => {
    timers.current.push(window.setTimeout(action, delay));
  }, []);

  const finish = useCallback(() => {
    clearTimers();
    setPhase("done");
  }, [clearTimers]);

  const beginExit = useCallback(() => {
    setHandoff(measureHandoff(markRef.current));
    setPhase("exit");
    schedule(finish, EXIT_FAILSAFE_DELAY);
  }, [finish, schedule]);

  const startAutomaticSequence = useCallback(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    clearTimers();

    if (shouldReduceMotion) {
      finish();
      return;
    }

    setPhase("portrait");
    schedule(() => setPhase("name"), AUTO_NAME_DELAY);
    schedule(beginExit, AUTO_EXIT_DELAY);
  }, [beginExit, clearTimers, finish, schedule, shouldReduceMotion]);

  const handleSkip = () => {
    if (phase === "loading" || phase === "exit") return;

    clearTimers();
    setPhase("name");
    schedule(beginExit, SKIP_EXIT_DELAY);
  };

  const handleMarkComplete = () => {
    if (phase === "exit") finish();
  };

  useEffect(() => clearTimers, [clearTimers]);

  if (phase === "done") return null;

  const isHandingOff = phase === "exit" && handoff !== null;
  const isMarkVisible = phase === "name" || isHandingOff;

  return (
    <button
      className="portfolio-intro"
      data-phase={phase}
      type="button"
      aria-label="Enter site"
      onClick={handleSkip}
    >
      <motion.div
        className="portfolio-intro__image"
        initial={false}
        animate={{
          opacity: phase === "loading" ? 0 : 1,
          transform: phase === "exit" ? "scale(1.025)" : "scale(1.04)",
        }}
        transition={{
          opacity: { duration: phase === "loading" ? 0 : 0.66 },
          scale: { duration: 3 },
        }}
      >
        <Image
          className="portfolio-intro__image"
          src={portrait.image}
          alt={portrait.alt}
          fill
          priority
          sizes="100vw"
          onLoad={startAutomaticSequence}
          onError={finish}
        />
      </motion.div>

      <motion.div
        className="portfolio-intro__identity"
        initial={false}
        animate={{
          opacity: phase === "name" ? 0.78 : 0,
          filter:
            phase === "name" ? "blur(0)" : "blur(var(--motion-blur-subtle))",
          transform:
            phase === "name"
              ? "translate(-50%, -50%)"
              : "translate(-50%, calc(-50% + var(--space-1)))",
        }}
        transition={{ duration: 0.66 }}
      >
        <BotanicalMark visible={phase === "name"} />
        <span className="portfolio-intro__role">Photographer</span>
      </motion.div>

      <motion.span
        className="portfolio-intro__veil"
        aria-hidden="true"
        initial={false}
        animate={{ opacity: phase === "exit" ? 1 : 0 }}
        transition={{ duration: 0.6 }}
      />

      {/* The mark sits above the veil: while the photo whitens, it travels to
          the page's own Être and darkens to match it, then the intro unmounts
          with the page's mark already in place underneath. */}
      <div className="portfolio-intro__mark-anchor" aria-hidden="true">
        <motion.div
          ref={markRef}
          className="portfolio-intro__mark"
          initial={false}
          animate={{
            opacity: isMarkVisible ? 1 : 0,
            x: isHandingOff ? handoff.x : 0,
            y: isHandingOff ? handoff.y : 0,
            scale: isHandingOff ? handoff.scale : 1,
          }}
          transition={isHandingOff ? handoffTransition : { duration: 0.66 }}
          onAnimationComplete={handleMarkComplete}
        >
          {/* biome-ignore lint/performance/noImgElement: static SVG logo; see site-header.tsx */}
          <img
            className="portfolio-intro__mark-image portfolio-intro__mark-image--light"
            src="/brand/etre-logo.svg"
            alt=""
          />
          {/* biome-ignore lint/performance/noImgElement: static SVG logo; see site-header.tsx */}
          <motion.img
            className="portfolio-intro__mark-image portfolio-intro__mark-image--dark"
            src="/brand/etre-logo.svg"
            alt=""
            initial={false}
            animate={{ opacity: isHandingOff ? 1 : 0 }}
            transition={handoffTransition}
          />
        </motion.div>
      </div>
    </button>
  );
};
