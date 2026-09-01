import type { StaticImageData } from "next/image";

export type CommissionService = "corporate" | "wedding";

/**
 * Images are statically imported from the data directory, so dimensions come
 * from the file itself and a wrong path fails the build instead of 404ing.
 */
export type CommissionCut = Readonly<{
  alt: string;
  image: StaticImageData;
  /**
   * External video URL (YouTube or Vimeo) when this cut belongs to
   * moving-image work. The index always shows the still; the detail page
   * embeds the player. `null` keeps the absence explicit rather than relying
   * on an optional property.
   */
  videoUrl: string | null;
}>;

export type CommissionMetaItem = Readonly<{
  label: string;
  value: string;
}>;

/** Page-level copy for a commission index, editable in content/<service>/section.yaml. */
export type CommissionSection = Readonly<{
  title: string;
  description: string;
  lede: string;
}>;

/**
 * One commission, shown as a set of three cuts rather than a single
 * thumbnail. Five corporate works and four wedding works cannot fill a
 * four-column tile grid, so the unit of these pages is a project.
 */
export type Commission = Readonly<{
  cuts: readonly [CommissionCut, CommissionCut, CommissionCut];
  /**
   * Structured meta rows: Corporate carries client / medium / year, Wedding
   * carries venue / area / year. The index joins the values with ／; the
   * detail page shows the labels too.
   */
  metaItems: readonly CommissionMetaItem[];
  /**
   * A second frame of the lead cut, from the same shoot. Present only on
   * moving-image work: the cross-fade on hover is the label. `null` keeps the
   * absence explicit rather than relying on an optional property.
   */
  motionFrame: CommissionCut | null;
  slug: string;
  title: string;
}>;
