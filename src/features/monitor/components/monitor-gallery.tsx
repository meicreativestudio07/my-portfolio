"use client";

import Image, { type StaticImageData } from "next/image";
import { useState } from "react";

import { GALLERY_SELECT_EVENT } from "@/lib/analytics";

type MonitorGalleryPhoto = Readonly<{
  image: StaticImageData;
  alt: string;
}>;

type MonitorGalleryProps = Readonly<{
  photos: readonly MonitorGalleryPhoto[];
}>;

/**
 * The monitor page's lead photo with the example cuts as thumbnails under
 * it. Hovering, focusing or tapping a thumbnail cross-fades the large frame
 * to that cut. Every large image stays mounted and only its opacity changes,
 * so a switch never waits on a network request.
 */
export const MonitorGallery = ({ photos }: MonitorGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="monitor-gallery">
      <div className="monitor-gallery__stage" data-reveal="rise">
        {photos.map((photo, index) => (
          <Image
            className="monitor-gallery__image"
            data-active={index === activeIndex}
            key={photo.image.src}
            src={photo.image}
            alt={index === activeIndex ? photo.alt : ""}
            aria-hidden={index !== activeIndex}
            priority={index === 0}
            sizes="(min-width: 48rem) 40vw, 100vw"
          />
        ))}
      </div>

      {photos.length > 1 ? (
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
