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

  const user = await prisma.user.findUnique({
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
      isSuspended: true,
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

  if (!user || user.isDeleted || user.accountStatus === "DELETED") {
    redirect("/auth/login?account=deleted");
  }

  if (user.accountStatus === "DEACTIVATED") {
    redirect("/auth/login?account=deactivated");
  }

  if (
    user.isSuspended ||
    user.accountStatus === "SUSPENDED" ||
    user.accountStatus === "BLOCKED"
  ) {
    redirect("/account-suspended");
  }

  if (!user.emailVerified) {
    redirect("/auth/send-verify-email");
  }

  if (user.accountStatus !== "ACTIVE") {
    redirect("/auth/login");
  }

  const { isSuspended: _isSuspended, ...activeUser } = user;

  return {
    ...activeUser,
    profileAvatarFileAsset: activeUser.profileAvatarFileAsset?.storageKey
      ? {
          storageKey: activeUser.profileAvatarFileAsset.storageKey,
          url: activeUser.profileAvatarFileAsset.url,
        }
      : null,
  };
}
