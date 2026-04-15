import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
import VerifyEmailRequestForm from "../_components/VerifyEmailRequestForm";

type VerifyEmailRequestPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function VerifyEmailRequestPage({
  searchParams,
}: VerifyEmailRequestPageProps) {
  const params = (await searchParams) ?? {};
  const email = getSingleParam(params.email)?.trim().toLowerCase() ?? "";

  const [site, config] = await Promise.all([
    getSiteSeoConfig(),
    getSiteConfigurationCached(),
  ]);

  return (
    <VerifyEmailRequestForm
      siteName={site.siteName}
      siteLogoUrl={config?.siteLogoFileAsset?.url}
      defaultEmail={email}
    />
  );
}
