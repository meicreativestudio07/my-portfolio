import type { StaticImageData } from "next/image";

/**
 * Images are statically imported from the data directory, so dimensions come
 * from the file itself and a wrong path fails the build instead of 404ing.
 */
export type WorkImage = Readonly<{
  alt: string;
  image: StaticImageData;
}>;

export type Work = Readonly<{
  category: string;
  client: string;
  images: readonly WorkImage[];
  publishedAt: string;
  slug: string;
  thumbnail: WorkImage;
  title: string;
}>;
