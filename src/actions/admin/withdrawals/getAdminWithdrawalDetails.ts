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
  calculateWithdrawalCommissionDueAmount,
  getWithdrawalCommissionSourceType,
  readWithdrawalSnapshotString,
} from "@/lib/payments/withdrawals/withdrawalCommissionSettings";
import type { WithdrawalFeePaymentSnapshot } from "@/lib/types/payments/withdrawalFee.types";
import type { WithdrawalCommissionPaymentSnapshot } from "@/lib/types/payments/withdrawalCommission.types";
import { readWithdrawalCommissionPaymentSnapshot } from "@/lib/withdrawals/withdrawalCommissionSnapshot";
import { readWithdrawalFeePaymentSnapshot } from "@/lib/withdrawals/withdrawalFeeSnapshot";
import { resolveWithdrawalSourceDisplayLabel } from "@/lib/withdrawals/withdrawalSourceDisplay";
import {
  readWithdrawalPaymentMethodSnapshot,
  type WithdrawalPaymentMethodOverride,
  type WithdrawalPaymentMethodReviewSnapshot,
} from "@/lib/withdrawals/withdrawalPaymentMethodReview";

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
  feePayment: WithdrawalFeePaymentSnapshot | null;
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
  allocationMode: "AUTO" | "SINGLE" | null;
  withdrawalMode: "NORMAL" | "EARLY_WITHDRAWAL" | null;
  earlyWithdrawalPenalty: number | null;
  netPayoutAmount: number | null;
  allocations: Array<{
    sourceType: "INVESTMENT_ORDER" | "SAVINGS_ACCOUNT";
    sourceLabel: string;
    sourceGrossAmount: number;
    sourcePenaltyAmount: number;
    sourceNetAmount: number;
    currency: string;
  }>;
  commissionDueAmount: number;
  commissionCalculationLabel: string;
  requester: {
    id: string;
    name: string | null;
    email: string | null;
  };
  viewerRole: "ADMIN" | "SUPER_ADMIN";
  payoutMethod: {
    id: string;
    type: string;
    bankName: string | null;
    accountName: string | null;
    accountNumber: string | null;
    network: string | null;
    address: string | null;
  } | null;
  paymentMethodReview: WithdrawalPaymentMethodReviewSnapshot;
  paymentMethodOverride: WithdrawalPaymentMethodOverride | null;
  canEditCommission: boolean;
};

export async function getAdminWithdrawalDetails(
  withdrawalId: string,
): Promise<AdminWithdrawalDetails | null> {
  const { role } = await requireDashboardRoleAccess(["ADMIN", "SUPER_ADMIN"]);

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
      allocations: {
        select: {
          sourceType: true,
          sourceLabel: true,
          sourceGrossAmount: true,
          sourcePenaltyAmount: true,
          sourceNetAmount: true,
          currency: true,
        },
      },
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
  const feePayment = readWithdrawalFeePaymentSnapshot(currentWithdrawal.payoutSnapshot);
  const paymentMethodSnapshot = readWithdrawalPaymentMethodSnapshot(
    currentWithdrawal.payoutSnapshot,
  );
  const payoutSnapshot =
    currentWithdrawal.payoutSnapshot &&
    typeof currentWithdrawal.payoutSnapshot === "object"
      ? (currentWithdrawal.payoutSnapshot as {
          sourceType?: string | null;
          sourceLabel?: string | null;
          allocationMode?: "AUTO" | "SINGLE" | null;
          withdrawalMode?: "NORMAL" | "EARLY_WITHDRAWAL" | null;
          earlyWithdrawalPenalty?: string | null;
          netPayoutAmount?: string | null;
          allocations?: Array<{
            sourceType?: string | null;
          } | null> | null;
        })
      : null;
  const allocationMode =
    payoutSnapshot?.allocationMode === "AUTO" ||
    payoutSnapshot?.allocationMode === "SINGLE"
      ? payoutSnapshot.allocationMode
      : null;
  const withdrawalMode =
    payoutSnapshot?.withdrawalMode === "EARLY_WITHDRAWAL" ||
    payoutSnapshot?.withdrawalMode === "NORMAL"
      ? payoutSnapshot.withdrawalMode
      : null;
  const commissionSourceType = getWithdrawalCommissionSourceType({
    investmentOrderId: currentWithdrawal.investmentOrderId,
    sourceType: readWithdrawalSnapshotString(currentWithdrawal.payoutSnapshot, "sourceType"),
    allocationMode,
  });
  const normalizedAllocations: AdminWithdrawalDetails["allocations"] =
    currentWithdrawal.allocations.map((allocation) => ({
      sourceType:
        allocation.sourceType === "INVESTMENT_ORDER"
          ? "INVESTMENT_ORDER"
          : "SAVINGS_ACCOUNT",
      sourceLabel: allocation.sourceLabel ?? "Withdrawal source",
      sourceGrossAmount: decimalToNumber(allocation.sourceGrossAmount),
      sourcePenaltyAmount: decimalToNumber(allocation.sourcePenaltyAmount),
      sourceNetAmount: decimalToNumber(allocation.sourceNetAmount),
      currency: allocation.currency,
    }));
  const commissionDueAmount = currentWithdrawal.hasCommissionFees
    ? calculateWithdrawalCommissionDueAmount({
        sourceType: commissionSourceType,
        amount: decimalToNumber(currentWithdrawal.amount),
        commissionPercent: decimalToNumber(currentWithdrawal.commissionPercent),
        savingsFeeAmount: currentWithdrawal.savingsFeeAmount
          ? decimalToNumber(currentWithdrawal.savingsFeeAmount)
          : null,
        allocations: normalizedAllocations.map((allocation) => ({
          sourceType: allocation.sourceType,
          sourceGrossAmount: allocation.sourceGrossAmount,
        })),
      })
    : 0;
  const commissionCalculationLabel =
    commissionSourceType === "SAVINGS_ACCOUNT"
      ? "Fixed fee applied to this withdrawal."
      : commissionSourceType === "MIXED"
        ? "Calculated from the mixed withdrawal allocation."
        : "Calculated from the withdrawal commission settings.";
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
    feePayment,
    requestedAt: currentWithdrawal.requestedAt.toISOString(),
    processedAt: currentWithdrawal.processedAt?.toISOString() ?? null,
    completedAt: currentWithdrawal.completedAt?.toISOString() ?? null,
    rejectedAt: currentWithdrawal.rejectedAt?.toISOString() ?? null,
    rejectionReason: currentWithdrawal.rejectionReason,
    adminNotes: currentWithdrawal.adminNotes,
    sourceType: normalizeSourceType(
      readWithdrawalSnapshotString(currentWithdrawal.payoutSnapshot, "sourceType"),
    ),
    sourceLabel: resolveWithdrawalSourceDisplayLabel(
      payoutSnapshot,
      currentWithdrawal.investmentOrder
        ? `Investment order - ${currentWithdrawal.investmentOrder.investmentPlan.name}`
        : currentWithdrawal.investmentAccount
          ? `Investment account - ${currentWithdrawal.investmentAccount.investmentPlan.name}`
          : "Direct withdrawal request",
    ),
    allocationMode,
    withdrawalMode,
    earlyWithdrawalPenalty:
      payoutSnapshot?.earlyWithdrawalPenalty !== undefined &&
      payoutSnapshot.earlyWithdrawalPenalty !== null
        ? decimalToNumber(payoutSnapshot.earlyWithdrawalPenalty)
        : null,
    netPayoutAmount:
      payoutSnapshot?.netPayoutAmount !== undefined &&
      payoutSnapshot.netPayoutAmount !== null
        ? decimalToNumber(payoutSnapshot.netPayoutAmount)
        : null,
    allocations: normalizedAllocations,
    commissionDueAmount,
    commissionCalculationLabel,
    requester: {
      id: currentWithdrawal.investorProfile.user.id,
      name: currentWithdrawal.investorProfile.user.name,
      email: currentWithdrawal.investorProfile.user.email,
    },
    viewerRole: role as "ADMIN" | "SUPER_ADMIN",
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
    paymentMethodReview: paymentMethodSnapshot.review,
    paymentMethodOverride: paymentMethodSnapshot.review.status === "UPDATED"
      ? paymentMethodSnapshot.override
      : null,
    canEditCommission: currentWithdrawal.status === "PENDING",
  };
}
