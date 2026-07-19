import { prisma } from "@/lib/prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { generateReferralCode } from "@/lib/referrals/generateReferralCode";
import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";
import ProfilePageView from "../_components/ProfilePageView";

async function ensureReferralCode(userId: string, name: string | null) {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      referralCode: true,
    },
  });

  if (existing?.referralCode) {
    return existing.referralCode;
  }

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const candidate = generateReferralCode(name);

    const conflict = await prisma.user.findUnique({
      where: { referralCode: candidate },
      select: {
        id: true,
      },
    });

    if (conflict) {
      continue;
    }

    const result = await prisma.user.updateMany({
      where: {
        id: userId,
        referralCode: null,
      },
      data: {
        referralCode: candidate,
      },
    });

    if (result.count > 0) {
      return candidate;
    }

    const refreshed = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        referralCode: true,
      },
    });

    if (refreshed?.referralCode) {
      return refreshed.referralCode;
    }
  }

  return null;
}

export default async function Page() {
  const sessionUser = await getCurrentSessionUser();
  const site = await getSiteConfigurationCached();

  if (!sessionUser?.id || !sessionUser.email) {
    return null;
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      image: true,
      role: true,
      emailVerified: true,
      referralCode: true,
      profileAvatarFileAsset: {
        select: {
          storageKey: true,
          url: true,
        },
      },
      referralsMade: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          code: true,
          status: true,
          activatedBy: true,
          activatedAt: true,
          rewardedAt: true,
          createdAt: true,
          referred: {
            select: {
              id: true,
              name: true,
              email: true,
              username: true,
              image: true,
            },
          },
        },
      },
    },
  });

  if (!dbUser) {
    return null;
  }

  const referralCode =
    dbUser.referralCode ?? (await ensureReferralCode(dbUser.id, dbUser.name));

  return (
    <ProfilePageView
      siteName={site?.siteName?.trim() || "Company"}
      user={{
        name: dbUser.name,
        email: dbUser.email,
        username: dbUser.username,
        image: dbUser.profileAvatarFileAsset?.url ?? dbUser.image,
        role: dbUser.role,
        isEmailVerified: dbUser.emailVerified,
        referralCode,
      }}
      referrals={dbUser.referralsMade.map((referral) => ({
        id: referral.id,
        code: referral.code,
        status: referral.status,
        activatedBy: referral.activatedBy,
        activatedAt: referral.activatedAt?.toISOString() ?? null,
        rewardedAt: referral.rewardedAt?.toISOString() ?? null,
        referredUser: {
          id: referral.referred.id,
          name: referral.referred.name,
          email: referral.referred.email,
          username: referral.referred.username,
          image: referral.referred.image,
        },
      }))}
    />
  );
}
