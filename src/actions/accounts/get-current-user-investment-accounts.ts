"use server";

import { type AccountStatus } from "@/generated/prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { formatDateLabel, formatEnumLabel } from "@/lib/formatters/formatters";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

type Decimalish = {
  toNumber(): number;
};

export type UserInvestmentAccountListItem = {
  id: string;
  status: AccountStatus;
  statusLabel: string;
  balance: number;
  currency: string;
  planName: string;
  planDescription: string;
  planPeriodLabel: string;
  investmentModelLabel: string;
  investmentName: string;
  investmentTypeLabel: string;
  orderCount: number;
  openedDate: string;
  createdDate: string;
  updatedDate: string;
};

export type UserInvestmentAccountsPageData = {
  totalAccountsCount: number;
  activeAccountsCount: number;
  pendingAccountsCount: number;
  totalBalance: number;
  marketAccountsCount: number;
  fixedAccountsCount: number;
  accounts: UserInvestmentAccountListItem[];
  readiness: {
    profileReady: boolean;
    kycReady: boolean;
    canOpenAnotherAccount: boolean;
  };
};

function toNumber(value: Decimalish | number | null | undefined) {
  if (typeof value === "number") return value;
  if (!value) return 0;
  return value.toNumber();
}

export async function getCurrentUserInvestmentAccountsAction(): Promise<UserInvestmentAccountsPageData> {
  const user = await getCurrentSessionUser();

  if (!user?.id) {
    redirect("/login");
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
          createdAt: true,
          updatedAt: true,
          currency: true,
          investmentOrders: {
            select: {
              id: true,
            },
          },
          investmentPlan: {
            select: {
              name: true,
              description: true,
              period: true,
              investmentModel: true,
              investment: {
                select: {
                  name: true,
                  type: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const accounts = (investorProfile?.investmentAccounts ?? []).map(
    (account) => ({
      id: account.id,
      status: account.status,
      statusLabel: formatEnumLabel(account.status),
      balance: toNumber(account.balance),
      currency: account.currency || "USD",
      planName: account.investmentPlan.name,
      planDescription:
        account.investmentPlan.description?.trim() ||
        "Structured investment plan aligned to your portfolio.",
      planPeriodLabel: formatEnumLabel(account.investmentPlan.period),
      investmentModelLabel: formatEnumLabel(
        account.investmentPlan.investmentModel,
      ),
      investmentName: account.investmentPlan.investment.name,
      investmentTypeLabel: formatEnumLabel(
        account.investmentPlan.investment.type,
      ),
      orderCount: account.investmentOrders.length,
      openedDate: formatDateLabel(account.openedAt, "Not opened yet"),
      createdDate: formatDateLabel(account.createdAt),
      updatedDate: formatDateLabel(account.updatedAt),
    }),
  );

  const totalAccountsCount = accounts.length;
  const activeAccountsCount = accounts.filter(
    (account) => account.status === "ACTIVE",
  ).length;
  const pendingAccountsCount = accounts.filter(
    (account) => account.status === "PENDING",
  ).length;
  const totalBalance = accounts.reduce(
    (sum, account) => sum + account.balance,
    0,
  );
  const marketAccountsCount = accounts.filter(
    (account) => account.investmentModelLabel === "Market",
  ).length;
  const fixedAccountsCount = accounts.filter(
    (account) => account.investmentModelLabel === "Fixed",
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
    totalBalance,
    marketAccountsCount,
    fixedAccountsCount,
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
