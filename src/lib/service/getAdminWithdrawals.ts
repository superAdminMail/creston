import type { PaymentMethodType, WithdrawalStatus } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import { decimalToNumber } from "@/lib/services/investment/decimal";
import { readWithdrawalCommissionPaymentSnapshot } from "@/lib/withdrawals/withdrawalCommissionSnapshot";
import { resolveWithdrawalSourceDisplayLabel } from "@/lib/withdrawals/withdrawalSourceDisplay";
import {
  readWithdrawalPaymentMethodSnapshot,
  resolveWithdrawalPaymentMethodLabel,
} from "@/lib/withdrawals/withdrawalPaymentMethodReview";

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
  commissionReviewStatus: "PENDING_REVIEW" | "APPROVED" | "REJECTED" | null;
  commissionSubmittedAmount: number | null;
  requestedAt: string;
  processedAt: string | null;
  completedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  adminNotes: string | null;
  sourceType: "INVESTMENT_ORDER" | "SAVINGS_ACCOUNT" | "INVESTMENT_POOL" | "SAVINGS_POOL";
  sourceLabel: string;
  paymentMethodLabel: string;
  paymentMethodStatus: "AVAILABLE" | "UNAVAILABLE" | "UPDATED";
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
          isVerified: true,
        },
      },
    },
  });

  function normalizeSourceType(
    value: string | null,
    withdrawal: {
      investmentOrder: { id: string } | null;
    },
  ): AdminWithdrawalItem["sourceType"] {
    if (
      value === "INVESTMENT_ORDER" ||
      value === "SAVINGS_ACCOUNT" ||
      value === "INVESTMENT_POOL" ||
      value === "SAVINGS_POOL"
    ) {
      return value;
    }

    return withdrawal.investmentOrder ? "INVESTMENT_ORDER" : "SAVINGS_ACCOUNT";
  }

  return withdrawals.map((withdrawal) => {
    const currentWithdrawal = withdrawal;
    const commissionPayment = readWithdrawalCommissionPaymentSnapshot(
      currentWithdrawal.payoutSnapshot,
    );
    const paymentMethodSnapshot = readWithdrawalPaymentMethodSnapshot(
      currentWithdrawal.payoutSnapshot,
    );
    const payoutSnapshot =
      currentWithdrawal.payoutSnapshot &&
      typeof currentWithdrawal.payoutSnapshot === "object"
        ? (currentWithdrawal.payoutSnapshot as Record<string, unknown>)
        : null;
    const snapshotSourceType =
      payoutSnapshot && typeof payoutSnapshot.sourceType === "string"
        ? payoutSnapshot.sourceType
        : null;

    return {
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
      commissionReviewStatus: commissionPayment?.reviewStatus ?? null,
      commissionSubmittedAmount: commissionPayment?.claimedAmount ?? null,
      requestedAt: withdrawal.requestedAt.toISOString(),
      processedAt: withdrawal.processedAt?.toISOString() ?? null,
      completedAt: withdrawal.completedAt?.toISOString() ?? null,
      rejectedAt: withdrawal.rejectedAt?.toISOString() ?? null,
      rejectionReason: withdrawal.rejectionReason,
      adminNotes: withdrawal.adminNotes,
      sourceType: normalizeSourceType(snapshotSourceType, {
        investmentOrder: currentWithdrawal.investmentOrder,
      }),
      sourceLabel: resolveWithdrawalSourceDisplayLabel(
        payoutSnapshot
          ? {
              sourceType:
                typeof payoutSnapshot.sourceType === "string"
                  ? payoutSnapshot.sourceType
                  : null,
              sourceLabel:
                typeof payoutSnapshot.sourceLabel === "string"
                  ? payoutSnapshot.sourceLabel
                  : null,
              allocations: Array.isArray(payoutSnapshot.allocations)
                ? payoutSnapshot.allocations
                    .map((allocation) => {
                      if (!allocation || typeof allocation !== "object") {
                        return null;
                      }

                      const typedAllocation = allocation as Record<string, unknown>;

                      return {
                        sourceType:
                          typeof typedAllocation.sourceType === "string"
                            ? typedAllocation.sourceType
                            : null,
                      };
                    })
                    .filter(
                      (
                        allocation,
                      ): allocation is { sourceType: string | null } =>
                        allocation !== null,
                    )
                : null,
            }
          : null,
        currentWithdrawal.investmentOrder
          ? `Investment order - ${currentWithdrawal.investmentOrder.investmentPlan.name}`
          : currentWithdrawal.investmentAccount
            ? `Investment account - ${currentWithdrawal.investmentAccount.investmentPlan.name}`
            : "Direct withdrawal request",
      ),
      paymentMethodLabel: resolveWithdrawalPaymentMethodLabel(
        currentWithdrawal.payoutMethod,
        paymentMethodSnapshot,
      ),
      paymentMethodStatus: paymentMethodSnapshot.review.status,
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
            isVerified: currentWithdrawal.payoutMethod.isVerified,
          }
        : null,
    };
  });
}
