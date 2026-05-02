import type { PaymentMethodType, WithdrawalStatus } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import { decimalToNumber } from "@/lib/services/investment/decimal";

export type AdminWithdrawalItem = {
  id: string;
  externalReference: string | null;
  reference: string | null;
  status: WithdrawalStatus;
  amount: number;
  currency: string;
  hasCommissionFees: boolean;
  commissionPercent: number;
  savingsFeeAmount: number | null;
  requestedAt: string;
  processedAt: string | null;
  completedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  adminNotes: string | null;
  sourceType: "INVESTMENT_ORDER" | "SAVINGS_ACCOUNT";
  sourceLabel: string;
  requester: {
    id: string;
    name: string | null;
    email: string | null;
  };
  payoutMethod: {
    id: string;
    type: PaymentMethodType;
    bankName: string | null;
    accountName: string | null;
    accountNumber: string | null;
    network: string | null;
    address: string | null;
    isVerified: boolean;
  } | null;
};

export async function getAdminWithdrawals(): Promise<AdminWithdrawalItem[]> {
  await requireDashboardRoleAccess(["ADMIN", "SUPER_ADMIN"]);

  const withdrawals = await prisma.withdrawalOrder.findMany({
    orderBy: {
      requestedAt: "desc",
    },
    take: 250,
    select: {
      id: true,
      externalReference: true,
      reference: true,
      status: true,
      amount: true,
      currency: true,
      hasCommissionFees: true,
      commissionPercent: true,
      savingsFeeAmount: true,
      requestedAt: true,
      processedAt: true,
      completedAt: true,
      rejectedAt: true,
      rejectionReason: true,
      adminNotes: true,
      investorProfile: {
        select: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      investmentAccount: {
        select: {
          id: true,
          investmentPlan: {
            select: {
              name: true,
            },
          },
        },
      },
      investmentOrder: {
        select: {
          id: true,
          investmentPlan: {
            select: {
              name: true,
            },
          },
        },
      },
      payoutMethod: {
        select: {
          id: true,
          type: true,
          bankName: true,
          accountName: true,
          accountNumber: true,
          network: true,
          address: true,
          isVerified: true,
        },
      },
    },
  });

  return withdrawals.map((withdrawal) => ({
    id: withdrawal.id,
    externalReference: withdrawal.externalReference,
    reference: withdrawal.reference,
    status: withdrawal.status,
    amount: decimalToNumber(withdrawal.amount),
    currency: withdrawal.currency,
    hasCommissionFees: withdrawal.hasCommissionFees,
    commissionPercent: decimalToNumber(withdrawal.commissionPercent),
    savingsFeeAmount: withdrawal.savingsFeeAmount
      ? decimalToNumber(withdrawal.savingsFeeAmount)
      : null,
    requestedAt: withdrawal.requestedAt.toISOString(),
    processedAt: withdrawal.processedAt?.toISOString() ?? null,
    completedAt: withdrawal.completedAt?.toISOString() ?? null,
    rejectedAt: withdrawal.rejectedAt?.toISOString() ?? null,
    rejectionReason: withdrawal.rejectionReason,
    adminNotes: withdrawal.adminNotes,
    sourceType: withdrawal.investmentOrder
      ? "INVESTMENT_ORDER"
      : "SAVINGS_ACCOUNT",
    sourceLabel: withdrawal.investmentOrder
      ? `Investment order - ${withdrawal.investmentOrder.investmentPlan.name}`
      : withdrawal.investmentAccount
        ? `Investment account - ${withdrawal.investmentAccount.investmentPlan.name}`
        : "Direct withdrawal request",
    requester: {
      id: withdrawal.investorProfile.user.id,
      name: withdrawal.investorProfile.user.name,
      email: withdrawal.investorProfile.user.email,
    },
    payoutMethod: withdrawal.payoutMethod
      ? {
          id: withdrawal.payoutMethod.id,
          type: withdrawal.payoutMethod.type,
          bankName: withdrawal.payoutMethod.bankName,
          accountName: withdrawal.payoutMethod.accountName,
          accountNumber: withdrawal.payoutMethod.accountNumber,
          network: withdrawal.payoutMethod.network,
          address: withdrawal.payoutMethod.address,
          isVerified: withdrawal.payoutMethod.isVerified,
        }
      : null,
  }));
}
