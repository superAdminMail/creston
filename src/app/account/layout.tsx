import { redirect } from "next/navigation";

import { AccountLayoutShell } from "@/components/account/AccountLayoutShell";
import NotificationListener from "@/components/notifications/NotificationListener";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { buildSeoMetadata } from "@/lib/seo/buildSeoMetadata";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
import { resolveGenericPageSeo } from "@/lib/seo/resolveSeoFallbacks";
import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";
import { DEFAULT_ONBOARDING_REDIRECT } from "@/routes";

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

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionUser = await getCurrentSessionUser();

  if (!sessionUser?.id) {
    redirect("/auth/login");
  }

  const onboardingState = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      role: true,
      hasCompletedOnboarding: true,
      investorProfile: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!onboardingState) {
    redirect("/auth/login");
  }

  if (
    onboardingState.role === "USER" &&
    !onboardingState.hasCompletedOnboarding &&
    !onboardingState.investorProfile
  ) {
    redirect(DEFAULT_ONBOARDING_REDIRECT);
  }

  let user = null;
  const [site, config] = await Promise.all([
    getSiteSeoConfig(),
    getSiteConfigurationCached(),
  ]);

  try {
    user = await getCurrentUser();
  } catch (error) {
    console.error("Error fetching current user:", error);
    user = null;
  }

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
