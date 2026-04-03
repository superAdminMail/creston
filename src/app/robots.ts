import type { MetadataRoute } from "next";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = await getSiteSeoConfig();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/account", "/admin", "/super-admin", "/api"],
      },
    ],
    sitemap: `${site.siteUrl}/sitemap.xml`,
  };
}
