"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import type { MouseEvent } from "react";
import { useCallback, useEffect, useRef } from "react";

import type { Work } from "@/features/work/types/work";

type WorkCardProps = Readonly<{
  index: number;
  isDeparting: boolean;
  isHidden: boolean;
  isRevealed: boolean;
  isSelected: boolean;
  onImageSettled: (index: number) => void;
  onSelectionExitComplete: () => void;
  onSelectionSettled: () => void;
  onSelect: (slug: string) => void;
  work: Work;
}>;

export const WorkCard = ({
  index,
  isDeparting,
  isHidden,
  isRevealed,
  isSelected,
  onImageSettled,
  onSelectionExitComplete,
  onSelectionSettled,
  onSelect,
  work,
}: WorkCardProps) => {
  const shouldReduceMotion = useReducedMotion();
  const imageRef = useRef<HTMLImageElement>(null);
  const hasSettled = useRef(false);
  const isInteractionDisabled = !isRevealed || isHidden;

  const handleLoadComplete = useCallback(() => {
    if (hasSettled.current) return;
    hasSettled.current = true;
    onImageSettled(index);
  }, [index, onImageSettled]);

  useEffect(() => {
    if (imageRef.current?.complete) {
      handleLoadComplete();
      return;
    }

    const timeout = window.setTimeout(handleLoadComplete, 4000);
    return () => window.clearTimeout(timeout);
  }, [handleLoadComplete]);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (isInteractionDisabled) return;
    onSelect(work.slug);
  };

  return (
    <motion.article
      initial={false}
      animate={{
        opacity: isHidden || !isRevealed ? 0 : 1,
        transform:
          isSelected && !shouldReduceMotion
            ? "scale(var(--layout-selection-scale))"
            : "scale(1)",
      }}
      transition={
        isDeparting
          ? {
              opacity: { duration: 0.33, delay: 0.43 },
              transform: { duration: 0.33 },
            }
          : { duration: 0.33 }
      }
      aria-hidden={isHidden ? true : undefined}
      inert={isHidden ? true : undefined}
      onAnimationComplete={() => {
        if (!isSelected) return;
        if (isDeparting) {
          onSelectionExitComplete();
          return;
        }
        onSelectionSettled();
      }}
    >
      <Link
        className="work-card"
        aria-disabled={isInteractionDisabled ? true : undefined}
        data-disabled={isInteractionDisabled ? "true" : undefined}
        data-hidden={isHidden ? "true" : undefined}
        href={`/work/${work.slug}`}
        onClick={handleClick}
        tabIndex={isInteractionDisabled ? -1 : undefined}
      >
        <motion.div
          className="work-card__inner"
          initial="rest"
          animate={isSelected ? "hover" : "rest"}
          whileHover="hover"
          whileFocus="hover"
        >
          <motion.span
            className="work-card__surface"
            aria-hidden="true"
            variants={{
              rest: { opacity: 0, transform: "scale(0.9)" },
              hover: { opacity: 1, transform: "scale(1)" },
            }}
            transition={{ duration: 0.22 }}
          />
          <div className="work-card__media">
            <motion.div
              className="work-card__reveal"
              initial={false}
              animate={{ opacity: isRevealed ? 1 : 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.33 }}
            >
              <Image
                className="work-card__image"
                ref={imageRef}
                src={work.thumbnail.image}
                alt={work.thumbnail.alt}
                fill
                priority={index < 4}
                sizes="(min-width: 768px) 25vw, 100vw"
                onLoad={handleLoadComplete}
                onError={handleLoadComplete}
              />
            </motion.div>
          </div>
          <h2 className="work-card__title">
            <span>{work.category}</span>
            <span>{work.title}</span>
          </h2>
        </motion.div>
      </Link>
    </motion.article>
  );
};
