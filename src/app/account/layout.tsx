import { redirect } from "next/navigation";

import { AccountLayoutShell } from "@/components/account/AccountLayoutShell";
import NotificationListener from "@/components/notifications/NotificationListener";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { buildSeoMetadata } from "@/lib/seo/buildSeoMetadata";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
import { resolveGenericPageSeo } from "@/lib/seo/resolveSeoFallbacks";
import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";

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
  const [user, site, config] = await Promise.all([
    getCurrentUser(),
    getSiteSeoConfig(),
    getSiteConfigurationCached(),
  ]);

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <AccountLayoutShell
      user={user}
      siteName={site.siteName}
      siteLogoUrl={config?.siteLogoFileAsset?.url ?? site.defaultOgImageUrl}
    >
      <NotificationListener userId={user.id} />
      {children}
    </AccountLayoutShell>
  );
}
