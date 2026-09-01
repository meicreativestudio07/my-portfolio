import { cache } from "react";

import { corporateCommissions } from "@/features/commission/data/corporate.generated";
import { commissionSections } from "@/features/commission/data/sections.generated";
import { weddingCommissions } from "@/features/commission/data/wedding.generated";
import type {
  Commission,
  CommissionSection,
  CommissionService,
} from "@/features/commission/types/commission";

const commissionsByService = {
  corporate: corporateCommissions,
  wedding: weddingCommissions,
} as const;

export const getCommissions = cache(
  async (service: CommissionService): Promise<readonly Commission[]> =>
    commissionsByService[service],
);

export const getCommissionBySlug = cache(
  async (
    service: CommissionService,
    slug: string,
  ): Promise<Commission | undefined> => {
    const commissions = await getCommissions(service);
    return commissions.find((commission) => commission.slug === slug);
  },
);

export const getCommissionSection = cache(
  async (service: CommissionService): Promise<CommissionSection> =>
    commissionSections[service],
);
