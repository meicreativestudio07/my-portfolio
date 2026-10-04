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

const AUTO_NAME_DELAY = 700;
// Kept short: many visitors arrive from ads and should reach the page fast.
const AUTO_EXIT_DELAY = 2500;
const SKIP_EXIT_DELAY = 450;
// Ends the intro even if the fade never reports completion.
const EXIT_FAILSAFE_DELAY = 2000;

// A slow, symmetric ease: the crossfade neither lurches into motion nor stops
// abruptly. Mirrors --motion-duration-crossfade / --motion-ease-crossfade,
// which the page beneath uses to fade in at the same moment.
const crossfadeTransition = {
  duration: 1.4,
  ease: [0.45, 0, 0.55, 1] as const,
};

export const PortfolioIntro = ({ portrait }: PortfolioIntroProps) => {
  const shouldReduceMotion = useReducedMotion();
  const timers = useRef<number[]>([]);
  const hasStarted = useRef(false);
  const [phase, setPhase] = useState<IntroPhase>("loading");

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

  // The intro fades out in place while the page underneath fades in (see the
  // hold rules in globals.css, released by data-phase="exit").
  const beginExit = useCallback(() => {
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

  const handleFadeComplete = () => {
    if (phase === "exit") finish();
  };

  useEffect(() => clearTimers, [clearTimers]);

  if (phase === "done") return null;

  const isNameVisible = phase === "name" || phase === "exit";

  return (
    <motion.button
      className="portfolio-intro"
      data-phase={phase}
      type="button"
      aria-label="Enter site"
      onClick={handleSkip}
      initial={false}
      animate={{ opacity: phase === "exit" ? 0 : 1 }}
      transition={crossfadeTransition}
      onAnimationComplete={handleFadeComplete}
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
          opacity: isNameVisible ? 0.78 : 0,
          filter: isNameVisible ? "blur(0)" : "blur(var(--motion-blur-subtle))",
          transform: isNameVisible
            ? "translate(-50%, -50%)"
            : "translate(-50%, calc(-50% + var(--space-1)))",
        }}
        transition={{ duration: 0.66 }}
      >
        <BotanicalMark visible={isNameVisible} />
        <span className="portfolio-intro__role">Photographer</span>
      </motion.div>

      <motion.div
        className="portfolio-intro__mark"
        aria-hidden="true"
        initial={false}
        animate={{ opacity: isNameVisible ? 1 : 0 }}
        transition={{ duration: 0.66 }}
      >
        {/* biome-ignore lint/performance/noImgElement: static SVG logo; see site-header.tsx */}
        <img
          className="portfolio-intro__mark-image"
          src="/brand/etre-logo.svg"
          alt=""
        />
      </motion.div>
    </motion.button>
  );
};
