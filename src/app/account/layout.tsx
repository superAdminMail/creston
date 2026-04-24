import { redirect } from "next/navigation";

import { AccountLayoutShell } from "@/components/account/AccountLayoutShell";
import NotificationListener from "@/components/notifications/NotificationListener";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { normalizeUser } from "@/lib/normalizeUser";
import { buildSeoMetadata } from "@/lib/seo/buildSeoMetadata";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
import { resolveGenericPageSeo } from "@/lib/seo/resolveSeoFallbacks";
import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";
import { requireActiveVerifiedUser } from "@/lib/auth/requireActiveVerifiedUser";

export async function generateMetadata() {
  const site = await getSiteSeoConfig();
  const seo = resolveGenericPageSeo(site, {
    title: "Account",
    description:
      "Manage your Havenstone account, view your investments, and access secure personal retirement planning tools.",
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
  const [sessionUser, dbUser, site, config] = await Promise.all([
    getCurrentSessionUser(),
    requireActiveVerifiedUser(),
    getSiteSeoConfig(),
    getSiteConfigurationCached(),
  ]);

  if (!sessionUser?.id) {
    redirect("/auth/login");
  }

  const user = normalizeUser({
    id: sessionUser.id,
    email: sessionUser.email,
    name: sessionUser.name,
    image: sessionUser.image,
    username: dbUser.username,
    role: dbUser.role,
    emailVerified: dbUser.emailVerified,
    profileAvatarFileAsset: dbUser.profileAvatarFileAsset ?? undefined,
    investorProfile: dbUser.investorProfile
      ? {
          kycStatus: dbUser.investorProfile.isVerified
            ? "VERIFIED"
            : dbUser.investorProfile.kycStatus,
        }
      : null,
  });

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <AccountLayoutShell
      user={user}
      siteName={site.siteName}
      siteLogoUrl={config?.siteLogoFileAsset?.url ?? site.defaultOgImageUrl}
    >
      <NotificationListener userId={sessionUser.id} />
      {children}
    </AccountLayoutShell>
  );
}
