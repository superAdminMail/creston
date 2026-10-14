import "server-only";

import { UserAccountStatus, UserRole } from "@/generated/prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { prisma } from "@/lib/prisma";

export type AccountAccessStatus =
  | "ACTIVE"
  | "SUSPENDED"
  | "DEACTIVATED"
  | "DELETED";

export type AccountAccessState = {
  id: string;
  role: UserRole;
  status: AccountAccessStatus;
  accountStatus: UserAccountStatus;
  emailVerified: boolean;
  isDeleted: boolean;
  isSuspended: boolean;
  deletedAt: Date | null;
  suspendedAt: Date | null;
} | null;

type AccountAccessStateInput = {
  id: string;
  role: UserRole;
  accountStatus: UserAccountStatus;
  emailVerified: boolean;
  isDeleted: boolean;
  isSuspended: boolean;
  deletedAt: Date | null;
  suspendedAt: Date | null;
};

function resolveAccountAccessStatus(input: {
  accountStatus: UserAccountStatus;
  isDeleted: boolean;
  isSuspended: boolean;
}): AccountAccessStatus {
  if (input.isDeleted || input.accountStatus === UserAccountStatus.DELETED) {
    return "DELETED";
  }

  if (input.accountStatus === UserAccountStatus.DEACTIVATED) {
    return "DEACTIVATED";
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

function mapAccountAccessState(
  user: AccountAccessStateInput,
): NonNullable<AccountAccessState> {
  return {
    id: user.id,
    role: user.role,
    status: resolveAccountAccessStatus({
      accountStatus: user.accountStatus,
      isDeleted: user.isDeleted,
      isSuspended: user.isSuspended,
    }),
    accountStatus: user.accountStatus,
    emailVerified: user.emailVerified,
    isDeleted: user.isDeleted,
    isSuspended: user.isSuspended,
    deletedAt: user.deletedAt,
    suspendedAt: user.suspendedAt,
  };
}

const accountAccessSelect = {
  id: true,
  role: true,
  accountStatus: true,
  emailVerified: true,
  isDeleted: true,
  isSuspended: true,
  deletedAt: true,
  suspendedAt: true,
} as const;

export async function getCurrentUserAccessState(): Promise<AccountAccessState> {
  const sessionUser = await getCurrentSessionUser();

  if (!sessionUser?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: accountAccessSelect,
  });

  return user ? mapAccountAccessState(user) : null;
}

export async function getLoginAccountAccessStateByEmail(
  email: string,
): Promise<AccountAccessState> {
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
    select: accountAccessSelect,
  });

  return user ? mapAccountAccessState(user) : null;
}
