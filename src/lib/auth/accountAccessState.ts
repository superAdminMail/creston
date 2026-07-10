import "server-only";

import { UserAccountStatus, UserRole } from "@/generated/prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { prisma } from "@/lib/prisma";

export type AccountAccessStatus = "ACTIVE" | "SUSPENDED" | "DELETED";

export type AccountAccessState = {
  id: string;
  role: UserRole;
  status: AccountAccessStatus;
  accountStatus: UserAccountStatus;
  isDeleted: boolean;
  isSuspended: boolean;
  deletedAt: Date | null;
  suspendedAt: Date | null;
} | null;

function resolveAccountAccessStatus(input: {
  accountStatus: UserAccountStatus;
  isDeleted: boolean;
  isSuspended: boolean;
}): AccountAccessStatus {
  if (
    input.isDeleted ||
    input.accountStatus === UserAccountStatus.DELETED
  ) {
    return "DELETED";
  }

  if (
    input.isSuspended ||
    input.accountStatus === UserAccountStatus.SUSPENDED ||
    input.accountStatus === UserAccountStatus.BLOCKED
  ) {
    return "SUSPENDED";
  }

  return "ACTIVE";
}

async function loadAccountAccessState(where: { id: string }) {
  const user = await prisma.user.findUnique({
    where,
    select: {
      id: true,
      role: true,
      accountStatus: true,
      isDeleted: true,
      isSuspended: true,
      deletedAt: true,
      suspendedAt: true,
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    role: user.role,
    status: resolveAccountAccessStatus({
      accountStatus: user.accountStatus,
      isDeleted: user.isDeleted,
      isSuspended: user.isSuspended,
    }),
    accountStatus: user.accountStatus,
    isDeleted: user.isDeleted,
    isSuspended: user.isSuspended,
    deletedAt: user.deletedAt,
    suspendedAt: user.suspendedAt,
  } satisfies AccountAccessState;
}

export async function getCurrentUserAccessState() {
  const sessionUser = await getCurrentSessionUser();

  if (!sessionUser?.id) {
    return null;
  }

  return loadAccountAccessState({ id: sessionUser.id });
}

export async function getLoginAccountAccessStateByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    return null;
  }

  const user = await prisma.user.findFirst({
    where: {
      email: {
        equals: normalizedEmail,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      role: true,
      accountStatus: true,
      isDeleted: true,
      isSuspended: true,
      deletedAt: true,
      suspendedAt: true,
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    role: user.role,
    status: resolveAccountAccessStatus({
      accountStatus: user.accountStatus,
      isDeleted: user.isDeleted,
      isSuspended: user.isSuspended,
    }),
    accountStatus: user.accountStatus,
    isDeleted: user.isDeleted,
    isSuspended: user.isSuspended,
    deletedAt: user.deletedAt,
    suspendedAt: user.suspendedAt,
  } satisfies AccountAccessState;
}
