"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { BotanicalMark } from "@/features/intro/components/botanical-mark";
import type { WorkImage } from "@/features/work/types/work";

type PortfolioIntroProps = Readonly<{
  portrait: WorkImage;
}>;

type IntroPhase = "loading" | "portrait" | "name" | "exit";

const AUTO_NAME_DELAY = 700;
const AUTO_EXIT_DELAY = 4000;
const SKIP_EXIT_DELAY = 450;

export const PortfolioIntro = ({ portrait }: PortfolioIntroProps) => {
  const router = useRouter();
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

  const enterWorks = useCallback(() => {
    router.replace("/portfolio");
  }, [router]);

  const startAutomaticSequence = useCallback(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    clearTimers();

    if (shouldReduceMotion) {
      enterWorks();
      return;
    }

    setPhase("portrait");
    schedule(() => setPhase("name"), AUTO_NAME_DELAY);
    schedule(() => setPhase("exit"), AUTO_EXIT_DELAY);
  }, [clearTimers, enterWorks, schedule, shouldReduceMotion]);

  const handleSkip = () => {
    if (phase === "loading" || phase === "exit") return;

    clearTimers();
    setPhase("name");
    schedule(() => setPhase("exit"), SKIP_EXIT_DELAY);
  };

  const handleVeilComplete = () => {
    if (phase === "exit") enterWorks();
  };

  useEffect(() => clearTimers, [clearTimers]);

  return (
    <button
      className="portfolio-intro"
      data-phase={phase}
      type="button"
      aria-label="Enter portfolio"
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
          onError={enterWorks}
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
        <p className="portfolio-intro__name">
          <span>Mei</span>
          <span>Takahashi</span>
        </p>
        <span className="portfolio-intro__role">Photographer</span>
      </motion.div>

      <motion.span
        className="portfolio-intro__veil"
        aria-hidden="true"
        initial={false}
        animate={{ opacity: phase === "exit" ? 1 : 0 }}
        transition={{ duration: 0.6 }}
        onAnimationComplete={handleVeilComplete}
      />
    </button>
  );
};
