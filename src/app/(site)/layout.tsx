import { cookies } from "next/headers";

import { getCurrentUserAccessState } from "@/lib/auth/accountAccessState";
import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";
import { canBypassMaintenanceMode } from "@/lib/site/maintenanceMode";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
import { getAppNoticeBannerCookieName } from "@/components/layout/appNoticeBannerCookie";
import { MaintenanceModePage } from "./_components/MaintenanceModePage";
import SiteLayoutClient from "./layout-client";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [site, config, accessState] = await Promise.all([
    getSiteSeoConfig(),
    getSiteConfigurationCached(),
    getCurrentUserAccessState(),
  ]);
  const isMaintenanceMode = config?.maintenanceModeEnabled ?? false;
  const maintenanceBypassed = canBypassMaintenanceMode(accessState);

  if (isMaintenanceMode && !maintenanceBypassed) {
    return (
      <div className="bg-site-shell flex min-h-screen flex-col text-foreground">
        <MaintenanceModePage
          siteName={site.siteName}
          siteTagline={site.siteTagline ?? ""}
          supportEmail={config?.supportEmail ?? null}
          siteLogoUrl={config?.siteLogoFileAsset?.url ?? site.defaultOgImageUrl}
        />
      </div>
    );
  }

  const disclaimerBannerDismissalKey = String(
    config?.updatedAt?.getTime() ?? 0,
  );
  const cookieStore = await cookies();
  const initialDisclaimerBannerDismissed =
    cookieStore.get(
      getAppNoticeBannerCookieName(disclaimerBannerDismissalKey),
    )?.value === "1";

  return (
    <div className="bg-site-shell flex min-h-screen flex-col text-foreground">
      <SiteLayoutClient
        siteName={site.siteName}
        siteLogoUrl={config?.siteLogoFileAsset?.url ?? site.defaultOgImageUrl}
        siteTagline={site.siteTagline ?? ""}
        siteDescription={site.siteDescription ?? ""}
        supportEmail={config?.supportEmail ?? ""}
        supportPhone={config?.supportPhone ?? ""}
        supportPhoneSecondary={config?.supportPhoneSecondary ?? ""}
        siteAddress={site.siteAddress ?? ""}
        siteCRN={site.siteCRN ?? ""}
        siteFRN={site.siteFRN ?? ""}
        maintenanceModeEnabled={isMaintenanceMode}
        maintenanceBypassed={maintenanceBypassed}
        disclaimerBannerEnabled={config?.disclaimerBannerEnabled ?? false}
        disclaimerBannerDismissalKey={disclaimerBannerDismissalKey}
        initialDisclaimerBannerDismissed={
          initialDisclaimerBannerDismissed
        }
        footerLinkGroups={[
          {
            title: "Platform",
            links: [
              { href: "/about", label: "About Us" },
              { href: "/investment-products", label: "Investment Products" },
              { href: "/investment-plans", label: "Investment Plans" },
            ],
          },
          {
            title: "Support",
            links: [
              { href: "/contact", label: "Contact" },
              { href: "/faq", label: "FAQ" },
              { href: "/privacy", label: "Privacy Policy" },
            ],
          },
        ]}
        year={new Date().getFullYear()}
      >
        {children}
      </SiteLayoutClient>
    </div>
  );
}
