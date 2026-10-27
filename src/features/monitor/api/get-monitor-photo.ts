import { getCommissions } from "@/features/commission/api/get-commissions";
import type { CommissionCut } from "@/features/commission/types/commission";

// The wedding work whose lead cut opens the monitor page. Falls back to the
// first wedding work so renaming or removing this folder never empties it.
const MONITOR_COMMISSION_SLUG = "white-sand-beach-pre-wedding";

export const getMonitorPhoto = async (): Promise<CommissionCut | undefined> => {
  const commissions = await getCommissions("wedding");
  const commission =
    commissions.find(({ slug }) => slug === MONITOR_COMMISSION_SLUG) ??
    commissions[0];
  return commission?.cuts[0];
};

// 「撮影例」に出す写真と、その順番。work は content/wedding のフォルダ名、
// cut は写真の番号(01.jpg なら 1)。並べ替え・差し替えはここだけを直す。
const MONITOR_GALLERY = [
  // 萌衣さんのお気に入りの3枚を、大きい写真のすぐ後ろに。
  { work: "white-sand-beach-pre-wedding", cut: 2 },
  { work: "green-garden-pre-wedding", cut: 1 },
  { work: "blue-sky-trees-pre-wedding", cut: 1 },
  { work: "green-garden-pre-wedding", cut: 2 },
  { work: "white-sand-beach-pre-wedding", cut: 3 },
  { work: "blue-sky-trees-pre-wedding", cut: 2 },
  { work: "dusk-waterside-pre-wedding", cut: 2 },
  { work: "green-garden-pre-wedding", cut: 3 },
  { work: "blue-sky-trees-pre-wedding", cut: 3 },
  { work: "dusk-waterside-pre-wedding", cut: 1 },
  { work: "dusk-waterside-pre-wedding", cut: 3 },
] as const;

/**
 * Example cuts for the monitor page, picked by hand from the wedding works.
 * An entry whose folder or number no longer exists is skipped, so renaming a
 * work never breaks the page.
 */
export const getMonitorGallery = async (): Promise<
  readonly CommissionCut[]
> => {
  const commissions = await getCommissions("wedding");
  return MONITOR_GALLERY.flatMap(({ work, cut }) => {
    const found = commissions.find(({ slug }) => slug === work)?.cuts[cut - 1];
    return found ? [found] : [];
  });
};
