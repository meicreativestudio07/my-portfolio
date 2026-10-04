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
