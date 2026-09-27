import type { Metadata } from "next";

import { PageReady } from "@/components/layout/page-ready";
import { InformationBotanical } from "@/features/information/components/information-botanical";
import { DEFAULT_SITE_TITLE } from "@/lib/site-metadata";

const title = "Statement";
const description =
  "髙橋 萌衣 / Takahashi Mei — 滋賀県を拠点に写真・映像の撮影・制作を行うフォトグラファー / ビデオグラファー。";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    siteName: DEFAULT_SITE_TITLE,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

const StatementPage = () => (
  <div className="site-shell">
    <main className="information">
      <PageReady />
      <div className="information__body">
        <header className="information__intro">
          <h1>髙橋 萌衣 / Takahashi Mei</h1>
          <p>フォトグラファー / ビデオグラファー</p>
        </header>

        <div className="information__profile">
          <p>滋賀県を拠点に、写真と映像の撮影・制作を行っています。</p>
          <p>
            企業のPR動画やプロモーション映像、ウェディングの写真・映像まで、
            <br className="pc-only" />
            企画の段階から撮影、編集、仕上げまでを一貫して手がけています。
            <br className="pc-only" />
            伝えたい想いや、その日にしかない空気感を大切に、見る人の心に届くビジュアルづくりを心がけています。
          </p>
          <p>
            また、現役の薬剤師としても働いており、{" "}
            <span className="u-nowrap">医療・ヘルスケア分野のPR</span>
            制作を得意としています。
            <br className="pc-only" />
            専門的な内容も正確に理解したうえで、わかりやすく、信頼感のある表現に落とし込むことができます。
          </p>
        </div>

        <section className="information__section" aria-labelledby="practice">
          <h2 id="practice">活動領域</h2>
          <p>
            <span className="u-nowrap">写真撮影</span> /{" "}
            <span className="u-nowrap">映像制作</span> /{" "}
            <span className="u-nowrap">企業PR動画</span> /{" "}
            <span className="u-nowrap">ウェディング撮影</span> /{" "}
            <span className="u-nowrap">医療・ヘルスケア分野のPR</span>
          </p>
        </section>

        <section className="information__section" aria-labelledby="tools">
          <h2 id="tools">使用ツール</h2>
          <p>
            <span className="u-nowrap">Photoshop</span> /{" "}
            <span className="u-nowrap">Lightroom</span> /{" "}
            <span className="u-nowrap">Premiere Pro</span> /{" "}
            <span className="u-nowrap">After Effects</span> /{" "}
            <span className="u-nowrap">Illustrator</span> /{" "}
            <span className="u-nowrap">DaVinci Resolve</span>
          </p>
        </section>
      </div>

      <InformationBotanical />
    </main>
  </div>
);

export default StatementPage;
