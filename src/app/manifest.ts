import type { MetadataRoute } from "next";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const site = await getSiteSeoConfig();

  return {
    name: site.siteName,
    short_name: site.siteName,
    description: site.siteDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#050B1F",
    theme_color: "#2563EB",
    icons: [
      {
        src: "/icon1.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
