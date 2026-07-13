import { buildSeoMetadata } from "@/lib/seo/buildSeoMetadata";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";
import { resolveGenericPageSeo } from "@/lib/seo/resolveSeoFallbacks";
import HomeContent from "./HomeContent";

export async function generateMetadata() {
  const [site, config] = await Promise.all([
    getSiteSeoConfig(),
    getSiteConfigurationCached(),
  ]);
  const isMaintenanceMode = config?.maintenanceModeEnabled ?? false;
  const seo = resolveGenericPageSeo(site, {
    title: isMaintenanceMode
      ? "Maintenance in progress"
      : "Secure and Modern Wealth Platform",
    description: isMaintenanceMode
      ? `${site.siteName} is currently undergoing scheduled maintenance.`
      : "The company is a secure and modern wealth platform.",
  });

  return buildSeoMetadata({
    site,
    ...seo,
    canonicalPath: "/",
    noIndex: isMaintenanceMode,
    noFollow: isMaintenanceMode,
  });
}

const page = () => <HomeContent />;

export default page;
