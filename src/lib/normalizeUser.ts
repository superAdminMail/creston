import type { UserRole } from "@/generated/prisma";

import { ProfileDTO, SessionUser } from "./types";

export type NormalizedAvatarAsset = {
  storageKey: string;
  url: string | null;
} | null;

type NormalizableUser =
  | (SessionUser & {
      role?: UserRole | string | null;
      emailVerified?: boolean;
      hasPassword?: boolean | null;
      profileAvatarFileAsset?: NormalizedAvatarAsset;
    })
  | null
  | undefined;

export function normalizeUser(user: NormalizableUser): ProfileDTO | null {
  if (!user?.email || !user.role) return null;

  const profileAvatar = user.profileAvatarFileAsset
    ? {
        key: user.profileAvatarFileAsset.storageKey,
        url: user.profileAvatarFileAsset.url ?? "",
      }
    : null;

  const normalizedUser: ProfileDTO = {
    id: user.id ?? "",
    email: user.email,
    role: user.role as UserRole,
    isEmailVerified: user.emailVerified ?? false,
    name: user.name ?? null,
    image: profileAvatar?.url || user.image || null,
    profileAvatar,
  };

  if (typeof user.hasPassword === "boolean") {
    normalizedUser.hasPassword = user.hasPassword;
  }

  return normalizedUser;
}
