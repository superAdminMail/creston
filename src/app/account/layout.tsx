import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { AccountLayoutShell } from "@/components/account/AccountLayoutShell";
import NotificationListener from "@/components/notifications/NotificationListener";
import { getCurrentUserAccessState } from "@/lib/auth/accountAccessState";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { buildSeoMetadata } from "@/lib/seo/buildSeoMetadata";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
import { canBypassMaintenanceMode } from "@/lib/site/maintenanceMode";
import { resolveGenericPageSeo } from "@/lib/seo/resolveSeoFallbacks";
import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";
import { getAppNoticeBannerCookieName } from "@/components/layout/appNoticeBannerCookie";
import { MaintenanceModePage } from "../(site)/_components/MaintenanceModePage";

export async function generateMetadata() {
  const site = await getSiteSeoConfig();
  const seo = resolveGenericPageSeo(site, {
    title: "Account",
    description: `Manage your ${site.siteName} account, view your investments, and access secure personal savings planning tools.`,
  });

  return buildSeoMetadata({
    site,
    ...seo,
    noIndex: true,
    noFollow: true,
  });
}

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [accessState, site, config] = await Promise.all([
    getCurrentUserAccessState(),
    getSiteSeoConfig(),
    getSiteConfigurationCached(),
  ]);
  const disclaimerBannerDismissalKey = String(
    config?.updatedAt?.getTime() ?? 0,
  );
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

  const cookieStore = await cookies();
  const initialDisclaimerBannerDismissed =
    cookieStore.get(
      getAppNoticeBannerCookieName(disclaimerBannerDismissalKey),
    )?.value === "1";

  if (!accessState) {
    redirect("/auth/login");
  }

  if (accessState.status === "DELETED") {
    redirect("/auth/login?account=deleted");
  }

  if (accessState.status === "SUSPENDED") {
    redirect("/account-suspended");
  }

  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <AccountLayoutShell
      user={user}
      siteName={site.siteName}
      siteLogoUrl={config?.siteLogoFileAsset?.url ?? site.defaultOgImageUrl}
      disclaimerBannerEnabled={config?.disclaimerBannerEnabled ?? false}
      disclaimerBannerDismissalKey={disclaimerBannerDismissalKey}
      initialDisclaimerBannerDismissed={
        initialDisclaimerBannerDismissed
      }
    >
      <NotificationListener userId={user.id} />
      {children}
    </AccountLayoutShell>
  );
}
