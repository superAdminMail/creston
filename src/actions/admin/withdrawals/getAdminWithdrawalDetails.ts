"use server";

import {
  formatCurrency,
  formatEnumLabel,
} from "@/lib/formatters/formatters";
import { prisma } from "@/lib/prisma";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import { decimalToNumber } from "@/lib/services/investment/decimal";
import type { WithdrawalCommissionPaymentSnapshot } from "@/lib/types/payments/withdrawalCommission.types";
import { readWithdrawalCommissionPaymentSnapshot } from "@/lib/withdrawals/withdrawalCommissionSnapshot";

export type AdminWithdrawalDetails = {
  id: string;
  status: string;
  statusLabel: string;
  commissionStatus: string;
  commissionStatusLabel: string;
  amount: string;
  currency: string;
  hasCommissionFees: boolean;
  commissionPercent: number;
  savingsFeeAmount: number | null;
  commissionPayment: WithdrawalCommissionPaymentSnapshot | null;
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
    type: string;
    bankName: string | null;
    accountName: string | null;
    accountNumber: string | null;
    network: string | null;
    address: string | null;
  } | null;
  canEditCommission: boolean;
};

export async function getAdminWithdrawalDetails(
  withdrawalId: string,
): Promise<AdminWithdrawalDetails | null> {
  await requireDashboardRoleAccess(["ADMIN", "SUPER_ADMIN"]);

  const withdrawal = await prisma.withdrawalOrder.findUnique({
    where: {
      id: withdrawalId,
    },
    select: {
      id: true,
      status: true,
      commissionStatus: true,
      amount: true,
      currency: true,
      hasCommissionFees: true,
      commissionPercent: true,
      savingsFeeAmount: true,
      payoutSnapshot: true,
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
        },
      },
    },
  });

  if (!withdrawal) {
    return null;
  }

  const commissionPayment = readWithdrawalCommissionPaymentSnapshot(
    withdrawal.payoutSnapshot,
  );

  return {
    id: withdrawal.id,
    status: withdrawal.status,
    statusLabel: formatEnumLabel(withdrawal.status),
    commissionStatus: withdrawal.commissionStatus,
    commissionStatusLabel: formatEnumLabel(withdrawal.commissionStatus),
    amount: formatCurrency(decimalToNumber(withdrawal.amount), withdrawal.currency),
    currency: withdrawal.currency,
    hasCommissionFees: withdrawal.hasCommissionFees,
    commissionPercent: decimalToNumber(withdrawal.commissionPercent),
    savingsFeeAmount: withdrawal.savingsFeeAmount
      ? decimalToNumber(withdrawal.savingsFeeAmount)
      : null,
    commissionPayment,
    requestedAt: withdrawal.requestedAt.toISOString(),
    processedAt: withdrawal.processedAt?.toISOString() ?? null,
    completedAt: withdrawal.completedAt?.toISOString() ?? null,
    rejectedAt: withdrawal.rejectedAt?.toISOString() ?? null,
    rejectionReason: withdrawal.rejectionReason,
    adminNotes: withdrawal.adminNotes,
    sourceType: withdrawal.investmentOrder ? "INVESTMENT_ORDER" : "SAVINGS_ACCOUNT",
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
        }
      : null,
    canEditCommission: withdrawal.status === "PENDING",
  };
}
