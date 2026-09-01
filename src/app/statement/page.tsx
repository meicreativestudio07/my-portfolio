import type { Metadata } from "next";

import { PageReady } from "@/components/layout/page-ready";
import { InformationBotanical } from "@/features/information/components/information-botanical";

const title = "Statement";
const description =
  "About Takahashi Mei — Photographer / Visual Artist based in Shiga, Japan. Working across photography, video production, creative direction, and visual planning.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
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
          <h1>Mei Takahashi</h1>
          <p>Photographer / Visual Artist</p>
        </header>

        <div className="information__profile">
          <p>Born in 2000. Based in Shiga, Japan.</p>
          <p>
            Working across photography, video production, creative direction,
            and visual planning from first idea to final image.
          </p>
        </div>

        <section className="information__section" aria-labelledby="practice">
          <h2 id="practice">Practice</h2>
          <p>
            Photography / Video Production / Creative Direction / Visual
            Planning
          </p>
        </section>

        <section className="information__section" aria-labelledby="tools">
          <h2 id="tools">Tools</h2>
          <p>
            Photoshop / Lightroom / Premiere Pro / After Effects / Illustrator /
            InDesign
          </p>
        </section>
      </div>

      <InformationBotanical />
    </main>
  </div>
);

export default StatementPage;
