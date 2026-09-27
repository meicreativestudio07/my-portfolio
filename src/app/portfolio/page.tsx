import { notFound } from "next/navigation";

// Portfolio is temporarily unpublished (content/portfolio and the /work
// routes are untouched). To restore it, remove this notFound() call and the
// one in work/[slug]/page.tsx, then add the nav links back in site-header.tsx
// and site-frame.tsx.
const WorksPage = async () => {
  notFound();
};

export default WorksPage;
