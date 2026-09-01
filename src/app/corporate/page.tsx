import type { Metadata } from "next";

import { PageReady } from "@/components/layout/page-ready";
import {
  getCommissionSection,
  getCommissions,
} from "@/features/commission/api/get-commissions";
import { CommissionBand } from "@/features/commission/components/commission-band";

export const generateMetadata = async (): Promise<Metadata> => {
  const section = await getCommissionSection("corporate");
  return { title: section.title, description: section.description };
};

const CorporatePage = async () => {
  const [section, commissions] = await Promise.all([
    getCommissionSection("corporate"),
    getCommissions("corporate"),
  ]);

  return (
    <main className="commission commission--corporate site-shell">
      <PageReady />

      <div className="commission__head">
        <h1 className="commission__title">{section.title}</h1>
        <p className="commission__lede">{section.lede}</p>
      </div>

      <ol className="commission__list">
        {commissions.map((commission, index) => (
          <CommissionBand
            commission={commission}
            index={index}
            key={commission.slug}
            variant="corporate"
          />
        ))}
      </ol>
    </main>
  );
};

export default CorporatePage;
