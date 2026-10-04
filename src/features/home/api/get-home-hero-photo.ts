import { getCommissions } from "@/features/commission/api/get-commissions";
import type { CommissionCut } from "@/features/commission/types/commission";

// The wedding work whose lead cut fronts the site. Falls back to the first
// wedding work so renaming or removing this folder never empties the page.
const HERO_COMMISSION_SLUG = "green-garden-pre-wedding";

export const getHomeHeroPhoto = async (): Promise<
  CommissionCut | undefined
> => {
  const commissions = await getCommissions("wedding");
  const commission =
    commissions.find(({ slug }) => slug === HERO_COMMISSION_SLUG) ??
    commissions[0];
  return commission?.cuts[0];
};
