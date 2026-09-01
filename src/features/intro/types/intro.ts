import type { StaticImageData } from "next/image";

export type IntroImage = Readonly<{
  alt: string;
  image: StaticImageData;
}>;
