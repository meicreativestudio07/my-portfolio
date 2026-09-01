import type { MetadataRoute } from "next";

import { getAbsoluteUrl, getSiteUrl } from "@/lib/site-metadata";

const robots = (): MetadataRoute.Robots => ({
  rules: {
    userAgent: "*",
    allow: "/",
    disallow: ["/api/"],
  },
  sitemap: getAbsoluteUrl("/sitemap.xml"),
  host: getSiteUrl(),
});

export default robots;
