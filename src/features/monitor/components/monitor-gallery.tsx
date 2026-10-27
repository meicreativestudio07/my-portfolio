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
// Desktop reading: one cut per this much scroll, so the pace stays the same
// however many cuts there are; the last ones are a thumbnail away.
const SCROLL_STEP_PX = 240;
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
  const thumbsRef = useRef<HTMLUListElement>(null);
  const swipeStartX = useRef<number | null>(null);
  // A hovered thumbnail is already under the pointer; scrolling the row to
  // it would slide another one under the pointer instead.
  const isHoverChange = useRef(false);
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
      const scrolled = Math.max(-scope.getBoundingClientRect().top, 0);
      const nextStep = Math.min(
        count - 1,
        Math.floor(scrolled / SCROLL_STEP_PX),
      );
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

  // Scrolls the sideways row so a thumbnail is in sight together with its
  // neighbours, which also uncovers the next one at either edge of the row.
  const revealThumb = useCallback((index: number) => {
    const row = thumbsRef.current;
    const thumbs = row?.children;
    const thumb = thumbs?.[index];
    if (!row || !thumbs || !(thumb instanceof HTMLElement)) return;
    const previous = thumbs[index - 1];
    const next = thumbs[index + 1];
    const start =
      previous instanceof HTMLElement ? previous.offsetLeft : thumb.offsetLeft;
    const end =
      next instanceof HTMLElement
        ? next.offsetLeft + next.offsetWidth
        : thumb.offsetLeft + thumb.offsetWidth;
    const left =
      start < row.scrollLeft
        ? start
        : end > row.scrollLeft + row.clientWidth
          ? end - row.clientWidth
          : row.scrollLeft;
    if (left === row.scrollLeft) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    row.scrollTo({ left, behavior: reduceMotion ? "auto" : "smooth" });
  }, []);

  // Swipes and reading move the photo; the row follows so the selection
  // never drops out of sight.
  useEffect(() => {
    if (isHoverChange.current) {
      isHoverChange.current = false;
      return;
    }
    revealThumb(activeIndex);
  }, [activeIndex, revealThumb]);

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
        <ul
          className="monitor-gallery__thumbs"
          aria-label="撮影例"
          ref={thumbsRef}
        >
          {photos.map((photo, index) => (
            <li key={photo.image.src}>
              <button
                className="monitor-gallery__thumb"
                type="button"
                aria-label={`撮影例${index + 1}を大きく表示`}
                aria-pressed={index === activeIndex}
                data-track={GALLERY_SELECT_EVENT}
                data-track-position={String(index + 1)}
                onClick={() => {
                  setActiveIndex(index);
                  revealThumb(index);
                }}
                onFocus={() => setActiveIndex(index)}
                onMouseEnter={() => {
                  if (index === activeIndex) return;
                  isHoverChange.current = true;
                  setActiveIndex(index);
                }}
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
