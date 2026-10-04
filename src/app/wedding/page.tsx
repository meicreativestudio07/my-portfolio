import type { Metadata } from "next";

import { PageReady } from "@/components/layout/page-ready";
import {
  getCommissionSection,
  getCommissions,
} from "@/features/commission/api/get-commissions";
import { CommissionBand } from "@/features/commission/components/commission-band";
import { DEFAULT_SITE_TITLE } from "@/lib/site-metadata";

export const generateMetadata = async (): Promise<Metadata> => {
  const section = await getCommissionSection("wedding");
  return {
    title: section.title,
    description: section.description,
    openGraph: {
      title: section.title,
      description: section.description,
      siteName: DEFAULT_SITE_TITLE,
    },
    twitter: {
      card: "summary_large_image",
      title: section.title,
      description: section.description,
    },
  };
};

const WeddingPage = async () => {
  const [section, commissions] = await Promise.all([
    getCommissionSection("wedding"),
    getCommissions("wedding"),
  ]);

  return (
    <main className="commission commission--wedding site-shell">
      <PageReady />

      <div className="commission__head">
        <h1 className="commission__title" data-reveal="text">
          {section.title}
        </h1>
        <p
          className="commission__lede"
          data-reveal="text"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Trusted content from YAML
          dangerouslySetInnerHTML={{ __html: section.lede }}
        />
      </div>

      <ol className="commission__list">
        {commissions.map((commission, index) => (
          <CommissionBand
            commission={commission}
            index={index}
            key={commission.slug}
            variant="wedding"
          />
        ))}
      </ol>
    </main>
  );
};

export default WeddingPage;
