import { prisma } from "./prisma";
import { getCurrentSessionUser } from "./getCurrentSessionUser";
import { normalizeUser } from "./normalizeUser";
import { cache } from "react";

export const getCurrentUser = cache(async () => {
  const sessionUser = await getCurrentSessionUser();

  if (!sessionUser?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      role: true,
      emailVerified: true,
      profileAvatarFileAsset: {
        select: {
          storageKey: true,
          url: true,
        },
      },
      investorProfile: {
        select: {
          kycStatus: true,
        },
      },
    },
  });

  if (!user) return null;

  return normalizeUser({
    id: sessionUser.id,
    email: sessionUser.email,
    name: sessionUser.name,
    image: sessionUser.image,
    role: user.role,
    emailVerified: user.emailVerified,
    profileAvatarFileAsset: user.profileAvatarFileAsset,
    investorProfile: user.investorProfile,
  });
});

export const getCurrentUserId = async () => {
  const sessionUser = await getCurrentSessionUser();
  return sessionUser?.id ?? null;
};

export const getCurrentUserRole = async () => {
  const sessionUser = await getCurrentSessionUser();

  if (!sessionUser?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      role: true,
    },
  });

  return user?.role ?? null;
};
