"use server";

import {
  formatCurrency,
  formatEnumLabel,
} from "@/lib/formatters/formatters";
import type { CommissionStatus } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import { decimalToNumber } from "@/lib/services/investment/decimal";
import {
  getWithdrawalCommissionSourceType,
  readWithdrawalSnapshotString,
} from "@/lib/payments/withdrawals/withdrawalCommissionSettings";
import type { WithdrawalCommissionPaymentSnapshot } from "@/lib/types/payments/withdrawalCommission.types";
import { readWithdrawalCommissionPaymentSnapshot } from "@/lib/withdrawals/withdrawalCommissionSnapshot";

export type AdminWithdrawalDetails = {
  id: string;
  status: string;
  statusLabel: string;
  commissionStatus: CommissionStatus;
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
  sourceType:
    | "INVESTMENT_ORDER"
    | "SAVINGS_ACCOUNT"
    | "INVESTMENT_POOL"
    | "SAVINGS_POOL";
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
      investmentOrderId: true,
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

  const currentWithdrawal = withdrawal;

  const commissionPayment = readWithdrawalCommissionPaymentSnapshot(
    currentWithdrawal.payoutSnapshot,
  );
  function normalizeSourceType(
    value: string | null,
  ): AdminWithdrawalDetails["sourceType"] {
    if (
      value === "INVESTMENT_ORDER" ||
      value === "SAVINGS_ACCOUNT" ||
      value === "INVESTMENT_POOL" ||
      value === "SAVINGS_POOL"
    ) {
      return value;
    }

    return getWithdrawalCommissionSourceType({
      investmentOrderId: currentWithdrawal.investmentOrderId,
    }) === "INVESTMENT_ORDER"
      ? "INVESTMENT_ORDER"
      : "SAVINGS_ACCOUNT";
  }

  return {
    id: currentWithdrawal.id,
    status: currentWithdrawal.status,
    statusLabel: formatEnumLabel(currentWithdrawal.status),
    commissionStatus: currentWithdrawal.commissionStatus,
    commissionStatusLabel: formatEnumLabel(currentWithdrawal.commissionStatus),
    amount: formatCurrency(decimalToNumber(currentWithdrawal.amount), currentWithdrawal.currency),
    currency: currentWithdrawal.currency,
    hasCommissionFees: currentWithdrawal.hasCommissionFees,
    commissionPercent: decimalToNumber(currentWithdrawal.commissionPercent),
    savingsFeeAmount: currentWithdrawal.savingsFeeAmount
      ? decimalToNumber(currentWithdrawal.savingsFeeAmount)
      : null,
    commissionPayment,
    requestedAt: currentWithdrawal.requestedAt.toISOString(),
    processedAt: currentWithdrawal.processedAt?.toISOString() ?? null,
    completedAt: currentWithdrawal.completedAt?.toISOString() ?? null,
    rejectedAt: currentWithdrawal.rejectedAt?.toISOString() ?? null,
    rejectionReason: currentWithdrawal.rejectionReason,
    adminNotes: currentWithdrawal.adminNotes,
    sourceType: normalizeSourceType(
      readWithdrawalSnapshotString(currentWithdrawal.payoutSnapshot, "sourceType"),
    ),
    sourceLabel:
      readWithdrawalSnapshotString(currentWithdrawal.payoutSnapshot, "sourceLabel") ??
      (currentWithdrawal.investmentOrder
        ? `Investment order - ${currentWithdrawal.investmentOrder.investmentPlan.name}`
        : currentWithdrawal.investmentAccount
          ? `Investment account - ${currentWithdrawal.investmentAccount.investmentPlan.name}`
          : "Direct withdrawal request"),
    requester: {
      id: currentWithdrawal.investorProfile.user.id,
      name: currentWithdrawal.investorProfile.user.name,
      email: currentWithdrawal.investorProfile.user.email,
    },
    payoutMethod: currentWithdrawal.payoutMethod
      ? {
          id: currentWithdrawal.payoutMethod.id,
          type: currentWithdrawal.payoutMethod.type,
          bankName: currentWithdrawal.payoutMethod.bankName,
          accountName: currentWithdrawal.payoutMethod.accountName,
          accountNumber: currentWithdrawal.payoutMethod.accountNumber,
          network: currentWithdrawal.payoutMethod.network,
          address: currentWithdrawal.payoutMethod.address,
        }
      : null,
    canEditCommission: currentWithdrawal.status === "PENDING",
  };
}
