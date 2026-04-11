import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
import RegisterForm from "../_components/RegisterForm";

const page = async () => {
  const [site, config] = await Promise.all([
    getSiteSeoConfig(),
    getSiteConfigurationCached(),
  ]);

  return (
    <div>
      <RegisterForm
        siteName={site.siteName}
        siteLogoUrl={config?.siteLogoFileAsset?.url}
      />
    </div>
  );
};

export default page;
