"use client";

import Image, { type StaticImageData } from "next/image";
import {
  type PointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { GALLERY_SELECT_EVENT } from "@/lib/analytics";

type MonitorGalleryPhoto = Readonly<{
  image: StaticImageData;
  alt: string;
}>;

type MonitorGalleryProps = Readonly<{
  photos: readonly MonitorGalleryPhoto[];
}>;

// A horizontal swipe shorter than this is a tap or a wobble, not a turn.
const SWIPE_DISTANCE_PX = 40;
// A trackpad flick fires many wheel events; one turn per this pause.
const WHEEL_DISTANCE_PX = 50;
const WHEEL_COOLDOWN_MS = 600;
// Matches the desktop breakpoint, where the photo column is sticky.
const STICKY_MEDIA_QUERY =
  "(min-width: 48rem) and (prefers-reduced-motion: no-preference)";

/**
 * The monitor page's lead photo with the example cuts as thumbnails under
 * it. The large frame cross-fades to another cut when a thumbnail is
 * hovered, focused or tapped, when the frame is swiped sideways (or
 * scrolled sideways on a trackpad), and on desktop as the reader scrolls
 * through the details beside it. Every large image stays mounted and only
 * its opacity changes, so a switch never waits on a network request.
 */
export const MonitorGallery = ({ photos }: MonitorGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const swipeStartX = useRef<number | null>(null);
  const count = photos.length;

  const step = useCallback(
    (direction: 1 | -1) =>
      setActiveIndex((current) => (current + direction + count) % count),
    [count],
  );

  // Desktop: the photo column is sticky, so reading down the details beside
  // it walks through the cuts. Only a change of step moves the photo, so a
  // thumbnail chosen by hand stays until the reader scrolls on.
  useEffect(() => {
    const media = window.matchMedia(STICKY_MEDIA_QUERY);
    const scope = rootRef.current?.closest<HTMLElement>("[data-gallery-scope]");
    if (!scope || count < 2) return;

    let lastStep = -1;
    let frame = 0;

    const update = () => {
      frame = 0;
      if (!media.matches) return;
      const rect = scope.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      if (travel <= 0) return;
      const progress = Math.min(Math.max(-rect.top / travel, 0), 1);
      const nextStep = Math.min(count - 1, Math.floor(progress * count));
      if (nextStep === lastStep) return;
      lastStep = nextStep;
      setActiveIndex(nextStep);
    };

    const handleScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [count]);

  // Trackpad: a sideways scroll over the photo turns it. A native listener,
  // because only a non-passive one may stop the browser's swipe-back
  // gesture from taking the same movement.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || count < 2) return;

    let distance = 0;
    let lockedUntil = 0;

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();
      if (event.timeStamp < lockedUntil) return;
      distance += event.deltaX;
      if (Math.abs(distance) < WHEEL_DISTANCE_PX) return;
      step(distance > 0 ? 1 : -1);
      distance = 0;
      lockedUntil = event.timeStamp + WHEEL_COOLDOWN_MS;
    };

    stage.addEventListener("wheel", handleWheel, { passive: false });
    return () => stage.removeEventListener("wheel", handleWheel);
  }, [count, step]);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") return;
    swipeStartX.current = event.clientX;
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const startX = swipeStartX.current;
    swipeStartX.current = null;
    if (startX === null) return;
    const distance = event.clientX - startX;
    if (Math.abs(distance) < SWIPE_DISTANCE_PX) return;
    step(distance < 0 ? 1 : -1);
  };

  return (
    <div className="monitor-gallery" ref={rootRef}>
      <div
        className="monitor-gallery__stage"
        data-reveal="rise"
        onPointerCancel={() => {
          swipeStartX.current = null;
        }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        ref={stageRef}
      >
        {photos.map((photo, index) => (
          <Image
            className="monitor-gallery__image"
            data-active={index === activeIndex}
            key={photo.image.src}
            src={photo.image}
            alt={index === activeIndex ? photo.alt : ""}
            aria-hidden={index !== activeIndex}
            draggable={false}
            priority={index === 0}
            sizes="(min-width: 48rem) 40vw, 100vw"
          />
        ))}
      </div>

      {count > 1 ? (
        <ul className="monitor-gallery__thumbs" aria-label="撮影例">
          {photos.map((photo, index) => (
            <li key={photo.image.src}>
              <button
                className="monitor-gallery__thumb"
                type="button"
                aria-label={`撮影例${index + 1}を大きく表示`}
                aria-pressed={index === activeIndex}
                data-track={GALLERY_SELECT_EVENT}
                data-track-position={String(index + 1)}
                onClick={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <Image
                  className="monitor-gallery__thumb-image"
                  src={photo.image}
                  alt=""
                  sizes="5rem"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};
