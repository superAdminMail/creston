import { prisma } from "@/lib/prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { generateReferralCode } from "@/lib/referrals/generateReferralCode";
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
    },
  });

  if (!dbUser) {
    return null;
  }

  const referralCode =
    dbUser.referralCode ?? (await ensureReferralCode(dbUser.id, dbUser.name));

  return (
      <ProfilePageView
      user={{
        name: dbUser.name,
        email: dbUser.email,
        username: dbUser.username,
        image: dbUser.profileAvatarFileAsset?.url ?? dbUser.image,
        role: dbUser.role,
        isEmailVerified: dbUser.emailVerified,
        referralCode,
      }}
    />
  );
}
