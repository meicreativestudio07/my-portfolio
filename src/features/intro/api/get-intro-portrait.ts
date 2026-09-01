import { introPortrait } from "@/features/intro/data/intro.generated";
import type { IntroImage } from "@/features/intro/types/intro";

export const getIntroPortrait = async (): Promise<IntroImage> => {
  return introPortrait;
};
