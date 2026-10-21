import { getCommissions } from "@/features/commission/api/get-commissions";
import type { CommissionCut } from "@/features/commission/types/commission";

// The wedding work whose lead cut opens the monitor page. Falls back to the
// first wedding work so renaming or removing this folder never empties it.
const MONITOR_COMMISSION_SLUG = "white-sand-beach-pre-wedding";

// How many example cuts the monitor page shows under "撮影例".
const MONITOR_GALLERY_SIZE = 6;

export const getMonitorPhoto = async (): Promise<CommissionCut | undefined> => {
  const commissions = await getCommissions("wedding");
  const commission =
    commissions.find(({ slug }) => slug === MONITOR_COMMISSION_SLUG) ??
    commissions[0];
  return commission?.cuts[0];
};

/**
 * Example cuts for the monitor page, taken round-robin across the wedding
 * works (every work's first cut, then every work's second cut, …) so the
 * set shows several couples and places rather than one shoot. The lead
 * photo is left out because it already opens the page.
 */
export const getMonitorGallery = async (): Promise<
  readonly CommissionCut[]
> => {
  const [commissions, lead] = await Promise.all([
    getCommissions("wedding"),
    getMonitorPhoto(),
  ]);
  const cutIndexes = [0, 1, 2] as const;
  return cutIndexes
    .flatMap((index) => commissions.map(({ cuts }) => cuts[index]))
    .filter((cut) => cut !== lead)
    .slice(0, MONITOR_GALLERY_SIZE);
};
