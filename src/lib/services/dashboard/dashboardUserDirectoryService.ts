import type { UserRole } from "@/generated/prisma";

import { formatCurrency, formatDateLabel } from "@/lib/formatters/formatters";
import { prisma } from "@/lib/prisma";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import { decimalToNumber } from "@/lib/services/investment/decimal";

type DirectoryVerificationStatus = "VERIFIED" | "PENDING" | "REJECTED";
type DirectoryAccountStatus = "ACTIVE" | "SUSPENDED" | "REVIEW";

export type DashboardDirectoryUser = {
  id: string;
  fullName: string;
  email: string;
  country: string;
  role: UserRole;
  verificationStatus: DirectoryVerificationStatus;
  accountStatus: DirectoryAccountStatus;
  totalDeposits: number;
  totalInvested: number;
  walletBalance: number;
  joinedAt: string;
};

export type DashboardUserDirectoryData = {
  users: DashboardDirectoryUser[];
  stats: {
    totalUsers: number;
    verifiedUsers: number;
    activeUsers: number;
    totalManagedFunds: number;
  };
};

type UserDirectoryRoute =
  | "/account/dashboard/super-admin/users"
  | "/account/dashboard/super-admin/moderators"
  | "/account/dashboard/super-admin/admins"
  | "/account/dashboard/admin/users";

const USER_DIRECTORY_ROUTE_CONFIG: Record<
  UserDirectoryRoute,
  {
    allowedRoles: ("SUPER_ADMIN" | "ADMIN")[];
    userRole: UserRole;
  }
> = {
  "/account/dashboard/super-admin/users": {
    allowedRoles: ["SUPER_ADMIN"],
    userRole: "USER",
  },
  "/account/dashboard/super-admin/moderators": {
    allowedRoles: ["SUPER_ADMIN"],
    userRole: "MODERATOR",
  },
  "/account/dashboard/super-admin/admins": {
    allowedRoles: ["SUPER_ADMIN"],
    userRole: "ADMIN",
  },
  "/account/dashboard/admin/users": {
    allowedRoles: ["ADMIN", "SUPER_ADMIN"],
    userRole: "USER",
  },
};

const ACTIVE_INVESTMENT_ORDER_STATUSES = new Set([
  "PENDING_CONFIRMATION",
  "CONFIRMED",
  "PAID",
  "PARTIALLY_PAID",
]);

function resolveVerificationStatus(user: {
  emailVerified: boolean;
  investorProfile: {
    kycStatus: "NOT_STARTED" | "PENDING_REVIEW" | "VERIFIED" | "REJECTED";
  } | null;
}): DirectoryVerificationStatus {
  if (user.investorProfile?.kycStatus === "VERIFIED") {
    return "VERIFIED";
  }

  if (user.investorProfile?.kycStatus === "REJECTED") {
    return "REJECTED";
  }

  return user.emailVerified ? "VERIFIED" : "PENDING";
}

function resolveAccountStatus(user: {
  isDeleted: boolean;
  scheduledDeletionAt: Date | null;
  emailVerified: boolean;
  investorProfile: {
    kycStatus: "NOT_STARTED" | "PENDING_REVIEW" | "VERIFIED" | "REJECTED";
  } | null;
}): DirectoryAccountStatus {
  if (user.isDeleted || user.scheduledDeletionAt) {
    return "SUSPENDED";
  }

  if (
    !user.emailVerified ||
    user.investorProfile?.kycStatus === "PENDING_REVIEW" ||
    user.investorProfile?.kycStatus === "REJECTED"
  ) {
    return "REVIEW";
  }

  return "ACTIVE";
}

export async function getDashboardUserDirectoryByHref(
  href: UserDirectoryRoute,
): Promise<DashboardUserDirectoryData> {
  const config = USER_DIRECTORY_ROUTE_CONFIG[href];

  await requireDashboardRoleAccess(config.allowedRoles);

  const users = await prisma.user.findMany({
    where: {
      role: config.userRole,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
      isDeleted: true,
      scheduledDeletionAt: true,
      createdAt: true,
      investorProfile: {
        select: {
          country: true,
          kycStatus: true,
          savingsAccounts: {
            select: {
              balance: true,
              transactions: {
                where: {
                  type: "DEPOSIT",
                },
                select: {
                  amount: true,
                },
              },
            },
          },
          investmentOrders: {
            select: {
              amount: true,
              status: true,
            },
          },
        },
      },
    },
  });

  const directoryUsers = users.map((user) => {
    const walletBalance =
      user.investorProfile?.savingsAccounts.reduce(
        (sum, account) => sum + decimalToNumber(account.balance),
        0,
      ) ?? 0;

    const savingsDeposits =
      user.investorProfile?.savingsAccounts.reduce(
        (sum, account) =>
          sum +
          account.transactions.reduce(
            (transactionSum, transaction) =>
              transactionSum + decimalToNumber(transaction.amount),
            0,
          ),
        0,
      ) ?? 0;

    const totalInvested =
      user.investorProfile?.investmentOrders.reduce((sum, order) => {
        return ACTIVE_INVESTMENT_ORDER_STATUSES.has(order.status)
          ? sum + decimalToNumber(order.amount)
          : sum;
      }, 0) ?? 0;

    const totalDeposits = savingsDeposits + totalInvested;
    const verificationStatus = resolveVerificationStatus(user);
    const accountStatus = resolveAccountStatus(user);

    return {
      id: user.id,
      fullName: user.name?.trim() || "Unnamed user",
      email: user.email,
      country: user.investorProfile?.country?.trim() || "Not set",
      role: user.role,
      verificationStatus,
      accountStatus,
      totalDeposits,
      totalInvested,
      walletBalance,
      joinedAt: formatDateLabel(user.createdAt),
    } satisfies DashboardDirectoryUser;
  });

  return {
    users: directoryUsers,
    stats: {
      totalUsers: directoryUsers.length,
      verifiedUsers: directoryUsers.filter(
        (user) => user.verificationStatus === "VERIFIED",
      ).length,
      activeUsers: directoryUsers.filter(
        (user) => user.accountStatus === "ACTIVE",
      ).length,
      totalManagedFunds: directoryUsers.reduce(
        (sum, user) => sum + user.totalInvested,
        0,
      ),
    },
  };
}

export function formatDirectoryCurrency(value: number) {
  return formatCurrency(value, "USD");
}
