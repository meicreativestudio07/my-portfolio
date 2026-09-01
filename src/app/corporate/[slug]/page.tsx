import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getCommissionBySlug,
  getCommissions,
} from "@/features/commission/api/get-commissions";
import { CommissionDetail } from "@/features/commission/components/commission-detail";

type CorporateWorkPageProps = Readonly<{
  params: Promise<{ slug: string }>;
}>;

export const generateStaticParams = async () => {
  const commissions = await getCommissions("corporate");
  return commissions.map((commission) => ({ slug: commission.slug }));
};

export const generateMetadata = async ({
  params,
}: CorporateWorkPageProps): Promise<Metadata> => {
  const { slug } = await params;
  const commission = await getCommissionBySlug("corporate", slug);
  return { title: commission?.title ?? "Corporate" };
};

const CorporateWorkPage = async ({ params }: CorporateWorkPageProps) => {
  const { slug } = await params;
  const [commission, commissions] = await Promise.all([
    getCommissionBySlug("corporate", slug),
    getCommissions("corporate"),
  ]);

  if (!commission) notFound();

  const currentIndex = commissions.findIndex(
    (item) => item.slug === commission.slug,
  );
  const nextCommission = commissions[(currentIndex + 1) % commissions.length];

  return (
    <CommissionDetail
      commission={commission}
      nextCommission={nextCommission}
      service="corporate"
    />
  );
};

export default CorporateWorkPage;
