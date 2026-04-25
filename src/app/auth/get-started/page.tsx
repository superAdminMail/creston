import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
import RegisterForm from "../_components/RegisterForm";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { redirect } from "next/navigation";

type AuthSearchParams = {
  ref?: string | string[];
  promo?: string | string[];
};

function firstValue(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

const page = async ({
  searchParams,
}: {
  searchParams?: Promise<AuthSearchParams>;
}) => {
  const sessionUser = await getCurrentSessionUser();

  if (sessionUser?.id) {
    redirect("/account");
  }

  const params = await searchParams;
  const referralCode = firstValue(params?.ref);
  const promoCode = firstValue(params?.promo);

  const [site, config] = await Promise.all([
    getSiteSeoConfig(),
    getSiteConfigurationCached(),
  ]);

  return (
    <div>
      <RegisterForm
        siteName={site.siteName}
        siteLogoUrl={config?.siteLogoFileAsset?.url}
        referralCode={referralCode}
        promoCode={promoCode}
      />
    </div>
  );
};

export default page;
