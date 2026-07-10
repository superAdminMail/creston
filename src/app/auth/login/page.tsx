import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
import LoginForm from "../_components/LoginForm";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { redirect } from "next/navigation";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

const page = async ({ searchParams }: LoginPageProps) => {
  const sessionUser = await getCurrentSessionUser();
  const params = (await searchParams) ?? {};
  const callbackUrl = getSingleParam(params.callbackUrl);

  if (sessionUser?.id) {
    redirect(
      callbackUrl?.startsWith("/account")
        ? `/auth/continue?callbackUrl=${encodeURIComponent(callbackUrl)}`
        : "/auth/continue",
    );
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
        callbackUrl={callbackUrl}
      />
    </div>
  );
};

export default page;
