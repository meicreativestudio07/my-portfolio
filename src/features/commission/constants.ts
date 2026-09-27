import type { CommissionService } from "@/features/commission/types/commission";

/**
 * Public URL segment for each service. corporate now publishes at /business
 * while its content folder and CMS field values stay "corporate"
 * (content/corporate/, getCommissions("corporate")) so editors don't need to
 * touch anything in Keystatic.
 */
export const commissionRouteSlugs: Record<CommissionService, string> = {
  corporate: "business",
  wedding: "wedding",
};
