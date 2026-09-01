import { cache } from "react";

import { works } from "@/features/work/data/works.generated";
import type { Work } from "@/features/work/types/work";

export const getWorks = cache(async (): Promise<readonly Work[]> => works);

export const getWorkBySlug = cache(
  async (slug: string): Promise<Work | undefined> =>
    works.find((work) => work.slug === slug),
);
