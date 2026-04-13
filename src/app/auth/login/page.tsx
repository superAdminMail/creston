import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
import LoginForm from "../_components/LoginForm";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { redirect } from "next/navigation";

const page = async () => {
  const sessionUser = await getCurrentSessionUser();

  if (sessionUser?.id) {
    redirect("/account");
  }

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
