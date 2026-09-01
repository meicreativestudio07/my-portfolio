import type { Metadata } from "next";

import { getWorks } from "@/features/work/api/get-works";
import { WorkGrid } from "@/features/work/components/work-grid";

export const metadata: Metadata = {
  title: "Portfolio",
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
