import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getCommissionBySlug,
  getCommissions,
} from "@/features/commission/api/get-commissions";
import { CommissionDetail } from "@/features/commission/components/commission-detail";

type WeddingWorkPageProps = Readonly<{
  params: Promise<{ slug: string }>;
}>;

export const generateStaticParams = async () => {
  const commissions = await getCommissions("wedding");
  return commissions.map((commission) => ({ slug: commission.slug }));
};

export const generateMetadata = async ({
  params,
}: WeddingWorkPageProps): Promise<Metadata> => {
  const { slug } = await params;
  const commission = await getCommissionBySlug("wedding", slug);
  return { title: commission?.title ?? "Wedding" };
};

const WeddingWorkPage = async ({ params }: WeddingWorkPageProps) => {
  const { slug } = await params;
  const [commission, commissions] = await Promise.all([
    getCommissionBySlug("wedding", slug),
    getCommissions("wedding"),
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
      service="wedding"
    />
  );
};

export default WeddingWorkPage;
