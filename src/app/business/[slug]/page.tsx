import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getCommissionBySlug,
  getCommissions,
} from "@/features/commission/api/get-commissions";
import { CommissionDetail } from "@/features/commission/components/commission-detail";
import { DEFAULT_SITE_TITLE } from "@/lib/site-metadata";

type BusinessWorkPageProps = Readonly<{
  params: Promise<{ slug: string }>;
}>;

export const generateStaticParams = async () => {
  const commissions = await getCommissions("corporate");
  return commissions.map((commission) => ({ slug: commission.slug }));
};

export const generateMetadata = async ({
  params,
}: BusinessWorkPageProps): Promise<Metadata> => {
  const { slug } = await params;
  const commission = await getCommissionBySlug("corporate", slug);

  if (!commission) {
    return { title: "Business" };
  }

  const metaSummary = commission.metaItems
    .map((item) => item.value)
    .filter(Boolean)
    .join(" / ");
  const description = `${commission.title} — Business work by Takahashi Mei.${metaSummary ? ` (${metaSummary})` : ""}`;
  const firstCut = commission.cuts[0];
  const imageUrl = firstCut?.image.src;

  return {
    title: commission.title,
    description,
    openGraph: {
      title: commission.title,
      description,
      siteName: DEFAULT_SITE_TITLE,
      type: "article",
      images: imageUrl
        ? [
            {
              url: imageUrl,
              alt: firstCut.alt || commission.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: commission.title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
};

const BusinessWorkPage = async ({ params }: BusinessWorkPageProps) => {
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

export default BusinessWorkPage;
