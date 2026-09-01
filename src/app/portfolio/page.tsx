import type { Metadata } from "next";

import { getWorks } from "@/features/work/api/get-works";
import { WorkGrid } from "@/features/work/components/work-grid";

const title = "Portfolio";
const description =
  "Selected personal photography works and visual projects by Takahashi Mei.";

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

const WorksPage = async () => {
  const works = await getWorks();

  return (
    <div className="site-shell">
      <main>
        <WorkGrid works={works} />
      </main>
    </div>
  );
};

export default WorksPage;
