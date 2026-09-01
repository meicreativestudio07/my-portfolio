import { Triangle } from "lucide-react";
import Image from "next/image";
import type { CSSProperties } from "react";

import { PageReady } from "@/components/layout/page-ready";
import { TransitionLink } from "@/components/navigation/transition-link";
import type {
  Commission,
  CommissionService,
} from "@/features/commission/types/commission";

type CommissionDetailProps = Readonly<{
  commission: Commission;
  nextCommission: Commission;
  service: CommissionService;
}>;

const serviceLabels = {
  corporate: "Corporate",
  wedding: "Wedding",
} as const;

/**
 * The CMS stores only the public URL of an externally hosted video. The index
 * never embeds it; here the recognized hosts map to their player URL, and an
 * unrecognized URL falls back to the still so a data mistake can never leave
 * a hole in the page.
 */
const getVideoEmbedUrl = (videoUrl: string): string | null => {
  if (!URL.canParse(videoUrl)) return null;

  const url = new URL(videoUrl);
  const host = url.hostname.replace(/^www\./, "");

  if (host === "youtube.com" || host === "m.youtube.com") {
    const id = url.searchParams.get("v");
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }

  if (host === "youtu.be") {
    const id = url.pathname.slice(1);
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }

  if (host === "vimeo.com") {
    const id = url.pathname.slice(1);
    return id ? `https://player.vimeo.com/video/${id}` : null;
  }

  return null;
};

export const CommissionDetail = ({
  commission,
  nextCommission,
  service,
}: CommissionDetailProps) => {
  const cutsWithEmbed = commission.cuts.map((cut) => ({
    cut,
    embedUrl: cut.videoUrl === null ? null : getVideoEmbedUrl(cut.videoUrl),
  }));
  const firstStillIndex = cutsWithEmbed.findIndex(
    ({ embedUrl }) => embedUrl === null,
  );

  return (
    <main className="detail site-shell">
      <PageReady />

      <TransitionLink className="detail__back" href={`/${service}`}>
        <Triangle
          className="icon icon--navigation icon--navigation-back"
          aria-hidden="true"
          fill="currentColor"
        />
        <span>Index</span>
      </TransitionLink>

      <header className="detail__header">
        <h1 className="detail__title">
          <span>{serviceLabels[service]}</span>
          <span>{commission.title}</span>
        </h1>
      </header>

      <div className="detail__images">
        {cutsWithEmbed.map(({ cut, embedUrl }, cutIndex) =>
          embedUrl ? (
            <iframe
              className="commission-detail__player"
              src={embedUrl}
              title={cut.alt}
              loading="lazy"
              allow="fullscreen; picture-in-picture"
              key={cut.image.src}
            />
          ) : (
            <div
              className="commission-detail__cut"
              style={
                {
                  "--commission-cut-ratio": `${cut.image.width} / ${cut.image.height}`,
                } as CSSProperties
              }
              key={cut.image.src}
            >
              <Image
                className="detail__image"
                src={cut.image}
                alt={cut.alt}
                fill
                sizes="(min-width: 48rem) 684px, 100vw"
                priority={cutIndex === firstStillIndex}
              />
            </div>
          ),
        )}
      </div>

      <div className="detail__project-info">
        <p>{commission.title}</p>
        <dl className="commission-detail__meta">
          {commission.metaItems.map((item) => (
            <div className="commission-detail__meta-row" key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <TransitionLink
        className="detail__next"
        href={`/${service}/${nextCommission.slug}`}
      >
        <span>
          {nextCommission.metaItems.at(0)?.value ?? serviceLabels[service]}
          <br />
          {nextCommission.title}
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
