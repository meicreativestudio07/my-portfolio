"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { useSiteNavigation } from "@/components/navigation/site-navigation-context";
import type { WorkImage } from "@/features/work/types/work";

type DetailImagesProps = Readonly<{
  images: readonly WorkImage[];
}>;

export const DetailImages = ({ images }: DetailImagesProps) => {
  const navigation = useSiteNavigation();
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const settledIndexes = useRef(new Set<number>());
  const [revealedCount, setRevealedCount] = useState(0);

  const handleImageSettled = useCallback((index: number) => {
    settledIndexes.current.add(index);
    setRevealedCount((current) => {
      let next = current;
      while (settledIndexes.current.has(next)) next += 1;
      return next;
    });
  }, []);

  useEffect(() => {
    if (revealedCount > 0) navigation?.markPageReady();
  }, [navigation, revealedCount]);

  useEffect(() => {
    for (const [index, image] of imageRefs.current.entries()) {
      if (image?.complete) handleImageSettled(index);
    }

    const timeout = window.setTimeout(() => {
      images.forEach((_, index) => {
        handleImageSettled(index);
      });
    }, 4000);

    return () => window.clearTimeout(timeout);
  }, [handleImageSettled, images]);

  return (
    <div className="detail__images">
      {images.map((image, index) => (
        <div
          className="detail__image-wrap"
          data-revealed={index < revealedCount ? "true" : "false"}
          style={
            {
              "--work-aspect-ratio": `${image.image.width} / ${image.image.height}`,
            } as React.CSSProperties
          }
          key={image.image.src}
        >
          <Image
            className="detail__image"
            ref={(element) => {
              imageRefs.current[index] = element;
            }}
            src={image.image}
            alt={image.alt}
            fill
            sizes="(min-width: 768px) 684px, 100vw"
            priority={index === 0}
            onError={() => handleImageSettled(index)}
            onLoad={() => handleImageSettled(index)}
          />
        </div>
      ))}
    </div>
  );
};
