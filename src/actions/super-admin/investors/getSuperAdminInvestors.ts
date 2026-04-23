"use server";

import type { KycStatus } from "@/generated/prisma";
import { formatDateLabel, formatEnumLabel } from "@/lib/formatters/formatters";
import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";
import { prisma } from "@/lib/prisma";

export type SuperAdminInvestorListItem = {
  id: string;
  name: string;
  email: string;
  username: string;
  phoneNumber: string;
  country: string;
  city: string;
  kycStatus: KycStatus;
  kycStatusLabel: string;
  isVerified: boolean;
  savingsAccountsCount: number;
  investmentAccountsCount: number;
  createdDate: string;
  updatedDate: string;
};

export type SuperAdminInvestorsPageData = {
  totalInvestorsCount: number;
  verifiedInvestorsCount: number;
  pendingReviewCount: number;
  investorsWithAccountsCount: number;
  investors: SuperAdminInvestorListItem[];
};

export async function getSuperAdminInvestors(): Promise<SuperAdminInvestorsPageData> {
  await requireSuperAdminAccess();

  const investors = await prisma.investorProfile.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      user: {
        select: {
          name: true,
          email: true,
          username: true,
        },
      },
      phoneNumber: true,
      country: true,
      city: true,
      kycStatus: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          savingsAccounts: true,
          investmentAccounts: true,
        },
      },
    },
  });

  const mappedInvestors = investors.map((investor) => ({
    id: investor.id,
    name: investor.user.name?.trim() || "Unnamed investor",
    email: investor.user.email,
    username: investor.user.username?.trim() || "Not set",
    phoneNumber: investor.phoneNumber?.trim() || "Not set",
    country: investor.country?.trim() || "Not set",
    city: investor.city?.trim() || "Not set",
    kycStatus: investor.kycStatus,
    kycStatusLabel: formatEnumLabel(investor.kycStatus),
    isVerified: investor.isVerified,
    savingsAccountsCount: investor._count.savingsAccounts,
    investmentAccountsCount: investor._count.investmentAccounts,
    createdDate: formatDateLabel(investor.createdAt),
    updatedDate: formatDateLabel(investor.updatedAt),
  }));

  return {
    totalInvestorsCount: mappedInvestors.length,
    verifiedInvestorsCount: mappedInvestors.filter(
      (investor) => investor.kycStatus === "VERIFIED" || investor.isVerified,
    ).length,
    pendingReviewCount: mappedInvestors.filter(
      (investor) => investor.kycStatus === "PENDING_REVIEW",
    ).length,
    investorsWithAccountsCount: mappedInvestors.filter(
      (investor) =>
        investor.savingsAccountsCount > 0 || investor.investmentAccountsCount > 0,
    ).length,
    investors: mappedInvestors,
  };
}
