import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
import ForgotPasswordForm from "../_components/ForgotPasswordForm";

export default async function ForgotPasswordPage() {
  const [site, config] = await Promise.all([
    getSiteSeoConfig(),
    getSiteConfigurationCached(),
  ]);

  return (
    <ForgotPasswordForm
      siteName={site.siteName}
      siteLogoUrl={config?.siteLogoFileAsset?.url}
    />
  );
}
