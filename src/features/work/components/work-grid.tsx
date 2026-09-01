"use client";

import {
  type MotionValue,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useSiteNavigation } from "@/components/navigation/site-navigation-context";
import type { Work } from "@/features/work/types/work";
import { WorkCard } from "./work-card";

type WorkGridProps = Readonly<{
  works: readonly Work[];
}>;

type TransitionPhase = "idle" | "selected" | "departing";

type IndexedWork = Readonly<{
  index: number;
  work: Work;
}>;

type ParallaxColumnStyle = CSSProperties &
  Readonly<{
    "--gallery-parallax-progress": MotionValue<number> | number;
  }>;

const galleryColumnCount = 4;
const galleryColumnIds = [
  "gallery-column-one",
  "gallery-column-two",
  "gallery-column-three",
  "gallery-column-four",
] as const;

const splitIntoColumns = (works: readonly Work[]) => {
  const columnLength = Math.ceil(works.length / galleryColumnCount);
  const indexedWorks = works.map((work, index) => ({ index, work }));

  return galleryColumnIds.map((id, columnIndex) => ({
    id,
    works: indexedWorks.slice(
      columnIndex * columnLength,
      (columnIndex + 1) * columnLength,
    ),
  })) satisfies readonly Readonly<{
    id: string;
    works: readonly IndexedWork[];
  }>[];
};

export const WorkGrid = ({ works }: WorkGridProps) => {
  const router = useRouter();
  const navigation = useSiteNavigation();
  const shouldReduceMotion = useReducedMotion();
  const gridRef = useRef<HTMLDivElement>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [transitionPhase, setTransitionPhase] =
    useState<TransitionPhase>("idle");
  const [settledIndexes, setSettledIndexes] = useState<ReadonlySet<number>>(
    new Set(),
  );
  const [revealedCount, setRevealedCount] = useState(0);
  const revealTimer = useRef<number | null>(null);
  const columns = useMemo(() => splitIntoColumns(works), [works]);
  const initialVisibleCount =
    typeof window !== "undefined" && window.innerWidth >= 768 ? 4 : 1;
  const { scrollYProgress } = useScroll({
    target: gridRef,
    offset: ["start start", "end end"],
  });
  const translateUp = useTransform(scrollYProgress, [0, 1], [0, -1]);
  const translateDown = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const upwardStyle = {
    "--gallery-parallax-progress": shouldReduceMotion ? 0 : translateUp,
  } as ParallaxColumnStyle;
  const downwardStyle = {
    "--gallery-parallax-progress": shouldReduceMotion ? 0 : translateDown,
  } as ParallaxColumnStyle;

  const handleImageSettled = useCallback((index: number) => {
    setSettledIndexes((current) => {
      if (current.has(index)) return current;
      return new Set(current).add(index);
    });
  }, []);

  useEffect(() => {
    if (!settledIndexes.has(revealedCount) || revealTimer.current !== null) {
      return;
    }

    const revealNext = () => {
      revealTimer.current = null;
      setRevealedCount((current) => current + 1);
    };

    if (revealedCount === 0 || shouldReduceMotion) {
      revealNext();
      return;
    }

    revealTimer.current = window.setTimeout(revealNext, 50);
    return () => {
      if (revealTimer.current !== null) {
        window.clearTimeout(revealTimer.current);
        revealTimer.current = null;
      }
    };
  }, [revealedCount, settledIndexes, shouldReduceMotion]);

  useEffect(() => {
    if (revealedCount >= initialVisibleCount) navigation?.markPageReady();
  }, [initialVisibleCount, navigation, revealedCount]);

  const handleSelect = (slug: string) => {
    if (selectedSlug) return;
    setSelectedSlug(slug);
    setTransitionPhase("selected");

    if (!shouldReduceMotion) navigation?.hideHeader();

    if (shouldReduceMotion) router.push(`/work/${slug}`);
  };

  const handleSelectionSettled = () => {
    if (transitionPhase === "selected" && !shouldReduceMotion) {
      setTransitionPhase("departing");
    }
  };

  const handleSelectionExitComplete = () => {
    if (!selectedSlug) return;

    const href = `/work/${selectedSlug}`;
    if (navigation) {
      navigation.navigate(href, { skipExit: true });
      return;
    }

    router.push(href);
  };

  return (
    <motion.div className="gallery" ref={gridRef}>
      <div className="gallery__grid">
        {columns.map((column, columnIndex) => (
          <motion.div
            className="gallery__column"
            key={column.id}
            style={columnIndex % 2 === 0 ? upwardStyle : downwardStyle}
          >
            {column.works.map(({ index, work }) => (
              <WorkCard
                index={index}
                isDeparting={
                  transitionPhase === "departing" && selectedSlug === work.slug
                }
                isHidden={
                  transitionPhase === "departing" ||
                  (selectedSlug !== null && selectedSlug !== work.slug)
                }
                isRevealed={index < revealedCount}
                isSelected={selectedSlug === work.slug}
                key={work.slug}
                onImageSettled={handleImageSettled}
                onSelectionExitComplete={handleSelectionExitComplete}
                onSelectionSettled={handleSelectionSettled}
                onSelect={handleSelect}
                work={work}
              />
            ))}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
