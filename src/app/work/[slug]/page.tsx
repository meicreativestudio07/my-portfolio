import { Triangle } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TransitionLink } from "@/components/navigation/transition-link";
import { getWorkBySlug, getWorks } from "@/features/work/api/get-works";
import { DetailImages } from "@/features/work/components/detail-images";
import { DetailIndexLink } from "@/features/work/components/detail-index-link";

type WorkPageProps = Readonly<{
  params: Promise<{ slug: string }>;
}>;

export const generateStaticParams = async () => {
  const works = await getWorks();
  return works.map((work) => ({ slug: work.slug }));
};

export const generateMetadata = async ({
  params,
}: WorkPageProps): Promise<Metadata> => {
  const { slug } = await params;
  const work = await getWorkBySlug(slug);
  return { title: work?.title ?? "Work" };
};

const WorkPage = async ({ params }: WorkPageProps) => {
  const { slug } = await params;
  const [work, works] = await Promise.all([getWorkBySlug(slug), getWorks()]);

  if (!work) notFound();

  const currentIndex = works.findIndex((item) => item.slug === work.slug);
  const nextWork = works[(currentIndex + 1) % works.length];
  const images = work.images.length > 0 ? work.images : [work.thumbnail];

  return (
    <main className="detail site-shell">
      <DetailIndexLink />
      <header className="detail__header">
        <h1 className="detail__title">
          <span>{work.category}</span>
          <span>{work.title}</span>
        </h1>
      </header>
      <DetailImages images={images} />
      <div className="detail__project-info">
        <p>{work.title}</p>
        <p>
          {work.client}
          <br />
          {work.publishedAt}
        </p>
      </div>
      <TransitionLink className="detail__next" href={`/work/${nextWork.slug}`}>
        <span>
          {nextWork.category}
          <br />
          {nextWork.title}
        </span>
        <Triangle
          className="icon icon--navigation icon--navigation-next"
          aria-hidden="true"
          fill="currentColor"
        />
      </TransitionLink>
    </main>
  );
};

export default WorkPage;
