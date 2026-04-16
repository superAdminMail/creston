import { redirect } from "next/navigation";

import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { prisma } from "@/lib/prisma";
import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
import VerifyEmailRequestForm from "../_components/VerifyEmailRequestForm";
import EmailVerificationWatcher from "@/app/auth/_components/EmailVerificationWatcher";

type VerifyEmailRequestPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

async function reconcileVerificationState(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      emailVerified: true,
      accountStatus: true,
      emailVerifiedAt: true,
    },
  });

  if (!user) {
    return null;
  }

  if (user.emailVerified && user.accountStatus !== "ACTIVE") {
    const verifiedAt = user.emailVerifiedAt ?? new Date();

    await prisma.user.update({
      where: { id: userId },
      data: {
        accountStatus: "ACTIVE",
        emailVerifiedAt: verifiedAt,
      },
    });

    return {
      ...user,
      accountStatus: "ACTIVE" as const,
      emailVerifiedAt: verifiedAt,
    };
  }

  return user;
}

export default async function VerifyEmailRequestPage({
  searchParams,
}: VerifyEmailRequestPageProps) {
  const params = (await searchParams) ?? {};
  const queryEmail = getSingleParam(params.email)?.trim().toLowerCase() ?? "";

  const [site, config, sessionUser] = await Promise.all([
    getSiteSeoConfig(),
    getSiteConfigurationCached(),
    getCurrentSessionUser(),
  ]);

  const verifiedState = sessionUser?.id
    ? await reconcileVerificationState(sessionUser.id)
    : null;

  if (
    verifiedState?.emailVerified &&
    verifiedState.accountStatus === "ACTIVE"
  ) {
    redirect("/account");
  }

  const defaultEmail = sessionUser?.email?.trim().toLowerCase() || queryEmail;

  return (
    <>
      <EmailVerificationWatcher redirectTo="/account" />
      <VerifyEmailRequestForm
        siteName={site.siteName}
        siteLogoUrl={config?.siteLogoFileAsset?.url}
        defaultEmail={defaultEmail}
      />
    </>
  );
}
