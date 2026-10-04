import type { Metadata } from "next";

import { PageReady } from "@/components/layout/page-ready";
import { TransitionLink } from "@/components/navigation/transition-link";
import {
  getCommissionSection,
  getCommissions,
} from "@/features/commission/api/get-commissions";
import { CommissionBand } from "@/features/commission/components/commission-band";
import { getVoices } from "@/features/voice/api/get-voices";
import { VoiceSection } from "@/features/voice/components/voice-section";
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
  const [section, commissions, voices] = await Promise.all([
    getCommissionSection("wedding"),
    getCommissions("wedding"),
    getVoices("wedding"),
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

        <section
          className="commission__monitor-call"
          aria-label="前撮りモニター募集"
          data-reveal="text"
        >
          <p>
            <span className="u-nowrap">前撮りモニター</span>{" "}
            <span className="u-nowrap">毎月3組限定</span>
          </p>
          <TransitionLink
            className="commission__monitor-call-link"
            href="/monitor"
          >
            詳しく見る →
          </TransitionLink>
        </section>
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

      <VoiceSection
        voices={voices}
        id="wedding-voice"
        title="Voice"
        variant="page"
      />

      <p className="commission__monitor" data-reveal="text">
        <TransitionLink className="commission__monitor-link" href="/monitor">
          前撮りモニター募集中 →
        </TransitionLink>
      </p>
    </main>
  );
};

export default WeddingPage;
