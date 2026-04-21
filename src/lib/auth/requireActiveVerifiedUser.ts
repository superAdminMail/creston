import { redirect } from "next/navigation";

import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { prisma } from "@/lib/prisma";
import type {
  KycStatus,
  UserAccountStatus,
  UserRole,
} from "@/generated/prisma";

type RequireActiveVerifiedUserResult = {
  id: string;
  role: UserRole;
  username: string | null;
  emailVerified: boolean;
  accountStatus: UserAccountStatus;
  emailVerifiedAt: Date | null;
  hasCompletedOnboarding: boolean;
  isDeleted: boolean;
  profileAvatarFileAsset: {
    storageKey: string;
    url: string | null;
  } | null;
  investorProfile: {
    id: string;
    kycStatus: KycStatus;
    isVerified: boolean;
  } | null;
};

export async function requireActiveVerifiedUser(): Promise<RequireActiveVerifiedUserResult> {
  const sessionUser = await getCurrentSessionUser();

  if (!sessionUser?.id) {
    redirect("/auth/login");
  }

  let user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      role: true,
      username: true,
      emailVerified: true,
      accountStatus: true,
      emailVerifiedAt: true,
      hasCompletedOnboarding: true,
      isDeleted: true,
      profileAvatarFileAsset: {
        select: {
          storageKey: true,
          url: true,
        },
      },
      investorProfile: {
        select: {
          id: true,
          kycStatus: true,
          isVerified: true,
        },
      },
    },
  });

  if (!user || user.isDeleted) {
    redirect("/auth/login");
  }

  if (user.emailVerified && user.accountStatus !== "ACTIVE") {
    const verifiedAt = user.emailVerifiedAt ?? new Date();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        accountStatus: "ACTIVE",
        emailVerifiedAt: verifiedAt,
      },
    });

    user = {
      ...user,
      accountStatus: "ACTIVE",
      emailVerifiedAt: verifiedAt,
    };
  }

  if (!user.emailVerified || user.accountStatus !== "ACTIVE") {
    redirect("/auth/send-verify-email");
  }

  return {
    ...user,
    profileAvatarFileAsset: user.profileAvatarFileAsset?.storageKey
      ? {
          storageKey: user.profileAvatarFileAsset.storageKey,
          url: user.profileAvatarFileAsset.url,
        }
      : null,
  };
}
