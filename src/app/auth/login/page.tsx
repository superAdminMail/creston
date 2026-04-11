import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
import LoginForm from "../_components/LoginForm";

const page = async () => {
  const [site, config] = await Promise.all([
    getSiteSeoConfig(),
    getSiteConfigurationCached(),
  ]);

  return (
    <div>
      <LoginForm
        siteName={site.siteName}
        siteLogoUrl={config?.siteLogoFileAsset?.url}
      />
    </div>
  );
};

export default page;
