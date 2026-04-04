"use server";

import { format } from "date-fns";

import { AccountStatus } from "@/generated/prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { prisma } from "@/lib/prisma";

export type UserInvestmentAccountListItem = {
  id: string;
  accountType: string;
  status: AccountStatus;
  statusLabel: string;
  balance: number;
  currency: string;
  planName: string;
  openedDate: string;
};

export type UserInvestmentAccountsPageData = {
  totalAccountsCount: number;
  activeAccountsCount: number;
  pendingAccountsCount: number;
  accounts: UserInvestmentAccountListItem[];
  readiness: {
    profileReady: boolean;
    kycReady: boolean;
    canOpenAnotherAccount: boolean;
  };
};

function toNumber(value: { toNumber(): number } | number | null | undefined) {
  if (typeof value === "number") return value;
  if (!value) return 0;
  return value.toNumber();
}

function formatLabel(value: string | null | undefined) {
  if (!value) return "Not available";

  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value: Date | null | undefined) {
  return value ? format(value, "MMM d, yyyy") : "Not opened yet";
}

export async function getCurrentUserInvestmentAccountsAction(): Promise<UserInvestmentAccountsPageData> {
  const user = await getCurrentSessionUser();

  if (!user?.id) {
    throw new Error("Unauthorized");
  }

  const investorProfile = await prisma.investorProfile.findUnique({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
      phoneNumber: true,
      dateOfBirth: true,
      country: true,
      state: true,
      city: true,
      addressLine1: true,
      addressLine2: true,
      kycStatus: true,
      investmentAccounts: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          status: true,
          balance: true,
          openedAt: true,
          currency: true,
          investmentPlan: {
            select: {
              name: true,
              period: true,
            },
          },
        },
      },
    },
  });

  const accounts = (investorProfile?.investmentAccounts ?? []).map((account) => ({
    id: account.id,
    accountType: formatLabel(account.investmentPlan.period),
    status: account.status,
    statusLabel: formatLabel(account.status),
    balance: toNumber(account.balance),
    currency: account.currency || "USD",
    planName: account.investmentPlan.name,
    openedDate: formatDate(account.openedAt),
  }));

  const totalAccountsCount = accounts.length;
  const activeAccountsCount = accounts.filter(
    (account) => account.status === AccountStatus.ACTIVE,
  ).length;
  const pendingAccountsCount = accounts.filter(
    (account) => account.status === AccountStatus.PENDING,
  ).length;

  const requiredProfileFields = [
    user.name?.trim(),
    user.email?.trim(),
    investorProfile?.phoneNumber?.trim(),
    investorProfile?.dateOfBirth,
    investorProfile?.country?.trim(),
    investorProfile?.state?.trim(),
    investorProfile?.city?.trim(),
    investorProfile?.addressLine1?.trim(),
    investorProfile?.addressLine2?.trim(),
  ];

  return {
    totalAccountsCount,
    activeAccountsCount,
    pendingAccountsCount,
    accounts,
    readiness: {
      profileReady: requiredProfileFields.every(Boolean),
      kycReady: investorProfile?.kycStatus === "VERIFIED",
      canOpenAnotherAccount:
        Boolean(investorProfile?.id) &&
        requiredProfileFields.every(Boolean) &&
        investorProfile?.kycStatus !== "REJECTED",
    },
  };
}
