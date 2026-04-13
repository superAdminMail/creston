import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
import VerifyEmailRequestForm from "../_components/VerifyEmailRequestForm";

export default async function VerifyEmailRequestPage() {
  const [site, config] = await Promise.all([
    getSiteSeoConfig(),
    getSiteConfigurationCached(),
  ]);

  return (
    <VerifyEmailRequestForm
      siteName={site.siteName}
      siteLogoUrl={config?.siteLogoFileAsset?.url}
    />
  );
}
