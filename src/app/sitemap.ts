import type { MetadataRoute } from "next";

import { getCommissions } from "@/features/commission/api/get-commissions";
import { getAbsoluteUrl } from "@/lib/site-metadata";

// Portfolio (/portfolio and /work/*) is temporarily unpublished, so its
// routes are deliberately left out of the sitemap. See the comment in
// app/portfolio/page.tsx to restore them.
const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const [corporateCommissions, weddingCommissions] = await Promise.all([
    getCommissions("corporate"),
    getCommissions("wedding"),
  ]);

  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: getAbsoluteUrl(""),
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: getAbsoluteUrl("/home"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: getAbsoluteUrl("/business"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: getAbsoluteUrl("/wedding"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: getAbsoluteUrl("/monitor"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: getAbsoluteUrl("/contact"),
      lastModified,
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: getAbsoluteUrl("/statement"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  const corporateRoutes: MetadataRoute.Sitemap = corporateCommissions.map(
    (commission) => ({
      url: getAbsoluteUrl(`/business/${commission.slug}`),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    }),
  );

  const weddingRoutes: MetadataRoute.Sitemap = weddingCommissions.map(
    (commission) => ({
      url: getAbsoluteUrl(`/wedding/${commission.slug}`),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    }),
  );

  return [...staticRoutes, ...corporateRoutes, ...weddingRoutes];
};

export default sitemap;
