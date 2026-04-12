import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
import { DashboardNavbarClient } from "./DashboardNavbar.client";

export async function DashboardNavbar(
  props: Omit<
    Parameters<typeof DashboardNavbarClient>[0],
    "siteName" | "siteLogoUrl"
  > & {
    siteName?: string;
    siteLogoUrl?: string | null;
  },
) {
  const [site, config] = await Promise.all([
    getSiteSeoConfig(),
    getSiteConfigurationCached(),
  ]);

  return (
    <DashboardNavbarClient
      {...props}
      siteName={props.siteName ?? site.siteName}
      siteLogoUrl={
        props.siteLogoUrl ??
        config?.siteLogoFileAsset?.url ??
        site.defaultOgImageUrl
      }
    />
  );
}
