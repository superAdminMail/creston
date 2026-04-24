"use server";

import { Prisma, type KycStatus } from "@/generated/prisma";
import { formatDateLabel, formatEnumLabel } from "@/lib/formatters/formatters";
import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";
import { prisma } from "@/lib/prisma";

type Decimalish = {
  toNumber(): number;
};

function toNumber(value: Decimalish | number | null | undefined) {
  if (typeof value === "number") return value;
  if (!value) return 0;
  return value.toNumber();
}

const investorDetailsSelect =
  Prisma.validator<Prisma.InvestorProfileSelect>()({
    id: true,
    isVerified: true,
    phoneNumber: true,
    dateOfBirth: true,
    age: true,
    country: true,
    state: true,
    city: true,
    addressLine1: true,
    kycStatus: true,
    createdAt: true,
    updatedAt: true,
    user: {
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        accountStatus: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    },
    investmentAccounts: {
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        status: true,
        balance: true,
        currency: true,
        createdAt: true,
        updatedAt: true,
        investmentPlan: {
          select: {
            name: true,
            period: true,
            investmentModel: true,
          },
        },
      },
    },
    savingsAccounts: {
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        name: true,
        status: true,
        balance: true,
        currency: true,
        createdAt: true,
        updatedAt: true,
        savingsProduct: {
          select: {
            name: true,
            interestEnabled: true,
          },
        },
      },
    },
    _count: {
      select: {
        investmentAccounts: true,
        savingsAccounts: true,
        paymentMethods: true,
        kycVerificationSessions: true,
      },
    },
  });

export type SuperAdminInvestorDetailsViewModel = {
  id: string;
  title: string;
  subtitle: string;
  kycStatus: KycStatus;
  kycStatusLabel: string;
  isVerified: boolean;
  owner: {
    name: string;
    email: string;
    username: string;
    role: string;
    accountStatus: string;
    emailVerified: boolean;
  };
  profile: {
    phoneNumber: string;
    dateOfBirthLabel: string;
    age: number;
    country: string;
    state: string;
    city: string;
    addressLine1: string;
  };
  counts: {
    investmentAccounts: number;
    savingsAccounts: number;
    paymentMethods: number;
    verificationSessions: number;
  };
  recentInvestmentAccounts: Array<{
    id: string;
    status: string;
    balance: number;
    currency: string;
    investmentPlanName: string;
    periodLabel: string;
    modelLabel: string;
    createdAt: string;
    updatedAt: string;
  }>;
  recentSavingsAccounts: Array<{
    id: string;
    name: string;
    status: string;
    balance: number;
    currency: string;
    productName: string;
    interestEnabled: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  timeline: Array<{
    id: string;
    label: string;
    value: string;
    tone: "default" | "positive" | "subtle";
  }>;
  formDefaults: {
    name: string;
    username: string;
    phoneNumber: string;
    dateOfBirth: string;
    country: string;
    state: string;
    city: string;
    addressLine1: string;
    kycStatus: KycStatus;
    isVerified: boolean;
  };
};

function formatDateInput(value: Date | null | undefined) {
  return value ? value.toISOString().slice(0, 10) : "";
}

export async function getSuperAdminInvestorById(
  investorId: string,
): Promise<SuperAdminInvestorDetailsViewModel | null> {
  await requireSuperAdminAccess();

  const investor = await prisma.investorProfile.findUnique({
    where: { id: investorId },
    select: investorDetailsSelect,
  });

  if (!investor) {
    return null;
  }

  return {
    id: investor.id,
    title: investor.user.name?.trim() || "Unnamed investor",
    subtitle: "Super-admin investor profile",
    kycStatus: investor.kycStatus,
    kycStatusLabel: formatEnumLabel(investor.kycStatus),
    isVerified: investor.isVerified,
    owner: {
      name: investor.user.name?.trim() || "Unnamed investor",
      email: investor.user.email,
      username: investor.user.username?.trim() || "Not set",
      role: formatEnumLabel(investor.user.role),
      accountStatus: formatEnumLabel(investor.user.accountStatus),
      emailVerified: investor.user.emailVerified,
    },
    profile: {
      phoneNumber: investor.phoneNumber?.trim() || "Not set",
      dateOfBirthLabel: formatDateLabel(investor.dateOfBirth, "Not set"),
      age: investor.age,
      country: investor.country?.trim() || "Not set",
      state: investor.state?.trim() || "Not set",
      city: investor.city?.trim() || "Not set",
      addressLine1: investor.addressLine1?.trim() || "Not set",
    },
    counts: {
      investmentAccounts: investor._count.investmentAccounts,
      savingsAccounts: investor._count.savingsAccounts,
      paymentMethods: investor._count.paymentMethods,
      verificationSessions: investor._count.kycVerificationSessions,
    },
    recentInvestmentAccounts: investor.investmentAccounts.map((account) => ({
      id: account.id,
      status: account.status,
      balance: toNumber(account.balance),
      currency: account.currency,
      investmentPlanName: account.investmentPlan.name,
      periodLabel: formatEnumLabel(account.investmentPlan.period),
      modelLabel: formatEnumLabel(account.investmentPlan.investmentModel),
      createdAt: formatDateLabel(account.createdAt),
      updatedAt: formatDateLabel(account.updatedAt),
    })),
    recentSavingsAccounts: investor.savingsAccounts.map((account) => ({
      id: account.id,
      name: account.name,
      status: account.status,
      balance: toNumber(account.balance),
      currency: account.currency,
      productName: account.savingsProduct.name,
      interestEnabled: account.savingsProduct.interestEnabled,
      createdAt: formatDateLabel(account.createdAt),
      updatedAt: formatDateLabel(account.updatedAt),
    })),
    timeline: [
      {
        id: "created",
        label: "Profile created",
        value: formatDateLabel(investor.createdAt),
        tone: "default",
      },
      {
        id: "updated",
        label: "Last updated",
        value: formatDateLabel(investor.updatedAt),
        tone: "subtle",
      },
    ],
    formDefaults: {
      name: investor.user.name ?? "",
      username: investor.user.username ?? "",
      phoneNumber: investor.phoneNumber ?? "",
      dateOfBirth: formatDateInput(investor.dateOfBirth),
      country: investor.country ?? "",
      state: investor.state ?? "",
      city: investor.city ?? "",
      addressLine1: investor.addressLine1 ?? "",
      kycStatus: investor.kycStatus,
      isVerified: investor.isVerified,
    },
  };
}
