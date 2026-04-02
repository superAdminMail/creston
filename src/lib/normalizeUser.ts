import type { UserRole } from "@/generated/prisma";

import { ProfileDTO, SessionUser } from "./types";

type NormalizedAvatarAsset = {
  storageKey: string;
  url: string | null;
} | null;

type NormalizableUser =
  | (SessionUser & {
      role?: UserRole | string | null;
      emailVerified?: boolean;
      password?: string | null;
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

  return {
    id: user.id ?? "",
    email: user.email,
    role: user.role as UserRole,
    isEmailVerified: user.emailVerified ?? false,
    hasPassword: Boolean(user.password),
    name: user.name ?? null,
    image: profileAvatar?.url || user.image || null,
    profileAvatar,
  };
}
