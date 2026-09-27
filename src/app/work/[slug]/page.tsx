import { notFound } from "next/navigation";

// Portfolio detail pages are temporarily unpublished alongside /portfolio.
// See the comment in app/portfolio/page.tsx for how to restore them.
export const generateStaticParams = async () => [];

const WorkPage = async () => {
  notFound();
};

export default WorkPage;
