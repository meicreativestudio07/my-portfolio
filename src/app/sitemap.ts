import type { MetadataRoute } from "next";

import { getCommissions } from "@/features/commission/api/get-commissions";
import { getWorks } from "@/features/work/api/get-works";
import { getAbsoluteUrl } from "@/lib/site-metadata";

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const [works, corporateCommissions, weddingCommissions] = await Promise.all([
    getWorks(),
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
      url: getAbsoluteUrl("/portfolio"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: getAbsoluteUrl("/corporate"),
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
      url: getAbsoluteUrl("/statement"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  const workRoutes: MetadataRoute.Sitemap = works.map((work) => ({
    url: getAbsoluteUrl(`/work/${work.slug}`),
    lastModified,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const corporateRoutes: MetadataRoute.Sitemap = corporateCommissions.map(
    (commission) => ({
      url: getAbsoluteUrl(`/corporate/${commission.slug}`),
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

  return [...staticRoutes, ...workRoutes, ...corporateRoutes, ...weddingRoutes];
};

export default sitemap;
