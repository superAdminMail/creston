import { getCurrentUserId } from "@/lib/getCurrentUser";
import { prisma } from "@/lib/prisma";
import type { AvailableWithdrawalBalanceSummary } from "@/lib/service/getAvailableWithdrawalBalance";
import { getAvailableWithdrawalBalance } from "@/lib/service/getAvailableWithdrawalBalance";
import { getWithdrawalSourceOptions } from "@/lib/service/getAvailableWithdrawalSource";
import type { WithdrawalRequestItemDto } from "@/lib/types/withdrawalRequests";
import { readWithdrawalCommissionPaymentSnapshot } from "@/lib/withdrawals/withdrawalCommissionSnapshot";
import { resolveWithdrawalSourceDisplayLabel } from "@/lib/withdrawals/withdrawalSourceDisplay";
import {
  readWithdrawalPaymentMethodSnapshot,
  resolveWithdrawalPaymentMethodLabel,
} from "@/lib/withdrawals/withdrawalPaymentMethodReview";
import WithdrawalsClient from "../_components/WithdrawalsClient";

export default async function Page() {
  const userId = await getCurrentUserId();

  if (!userId) return null;

  const profile = await prisma.investorProfile.findUnique({
    where: { userId },
    include: {
      paymentMethods: true,
      withdrawalOrders: {
        include: {
          payoutMethod: true,
          investmentOrder: {
            include: {
              investmentPlan: {
                select: {
                  name: true,
                  investmentModel: true,
                },
              },
            },
          },
          investmentAccount: {
            select: {
              id: true,
              currency: true,
              investmentPlan: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          requestedAt: "desc",
        },
        take: 8,
      },
    },
  });

  const withdrawalSources = profile?.id
    ? await getWithdrawalSourceOptions(profile.id)
    : [];
  const availableBalance = profile?.id
    ? await getAvailableWithdrawalBalance(profile.id)
    : ({
        totalBalance: 0,
        accountBalance: 0,
        savingsBalance: 0,
        currency: "USD",
        investmentOrders: [],
      } satisfies AvailableWithdrawalBalanceSummary);

  const withdrawalOrders: WithdrawalRequestItemDto[] =
    profile?.withdrawalOrders?.map((order) => {
      const commissionPayment = readWithdrawalCommissionPaymentSnapshot(
        order.payoutSnapshot,
      );
      const paymentMethodSnapshot = readWithdrawalPaymentMethodSnapshot(
        order.payoutSnapshot,
      );
      const payoutSnapshot =
        order.payoutSnapshot &&
        typeof order.payoutSnapshot === "object" &&
        !Array.isArray(order.payoutSnapshot)
          ? (order.payoutSnapshot as Record<string, unknown>)
          : null;
      const rawWithdrawalMode =
        typeof payoutSnapshot?.withdrawalMode === "string"
          ? payoutSnapshot.withdrawalMode
          : null;
      const storedPenaltyAmount =
        payoutSnapshot && typeof payoutSnapshot.penaltyAmount === "string"
          ? payoutSnapshot.penaltyAmount
          : null;
      const normalizedWithdrawalMode =
        rawWithdrawalMode === "EARLY_WITHDRAWAL" ||
        rawWithdrawalMode === "NORMAL"
          ? rawWithdrawalMode
          : storedPenaltyAmount && Number(storedPenaltyAmount) > 0
            ? "EARLY_WITHDRAWAL"
            : null;
      const rawEarlyWithdrawalPenalty =
        typeof payoutSnapshot?.earlyWithdrawalPenalty === "string" &&
        payoutSnapshot.earlyWithdrawalPenalty.trim().length > 0
          ? payoutSnapshot.earlyWithdrawalPenalty
          : null;
      const normalizedEarlyWithdrawalPenalty =
        rawEarlyWithdrawalPenalty ??
        (storedPenaltyAmount && Number(storedPenaltyAmount) > 0
          ? storedPenaltyAmount
          : null);
      const sourceLabel = resolveWithdrawalSourceDisplayLabel(
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
        order.investmentOrder?.investmentPlan?.name ??
          order.investmentAccount?.investmentPlan?.name ??
          "Withdrawal source",
      );
      const paymentMethodLabel = resolveWithdrawalPaymentMethodLabel(
        order.payoutMethod,
        paymentMethodSnapshot,
      );

      return {
        id: order.id,
        amount: order.amount.toString(),
        currency: order.currency,
        status: order.status,
        rejectionReason: order.rejectionReason,
        hasCommissionFees: order.hasCommissionFees,
        commissionStatus: order.commissionStatus,
        requestedAt: order.requestedAt.toISOString(),
        paymentMethodLabel,
        paymentMethodStatus: paymentMethodSnapshot.review.status,
        payoutMethod: order.payoutMethod
          ? {
              id: order.payoutMethod.id,
              type: order.payoutMethod.type,
              bankName: order.payoutMethod.bankName,
              network: order.payoutMethod.network,
            }
          : null,
        payoutSnapshot: payoutSnapshot
          ? {
              sourceType:
                typeof payoutSnapshot.sourceType === "string"
                  ? payoutSnapshot.sourceType
                  : null,
              sourceLabel,
              allocationMode:
                payoutSnapshot.allocationMode === "AUTO" ||
                payoutSnapshot.allocationMode === "SINGLE"
                  ? payoutSnapshot.allocationMode
                  : null,
              withdrawalMode: normalizedWithdrawalMode,
              earlyWithdrawalPenalty: normalizedEarlyWithdrawalPenalty,
              allocations:
                Array.isArray(payoutSnapshot.allocations)
                  ? payoutSnapshot.allocations
                      .map((allocation) => {
                        if (!allocation || typeof allocation !== "object") {
                          return null;
                        }

                        const typedAllocation = allocation as Record<string, unknown>;
                        const allocationSourceType =
                          typeof typedAllocation.sourceType === "string"
                            ? typedAllocation.sourceType
                            : null;

                        if (
                          allocationSourceType !== "INVESTMENT_ORDER" &&
                          allocationSourceType !== "SAVINGS_ACCOUNT"
                        ) {
                          return null;
                        }

                        const sourceType: "INVESTMENT_ORDER" | "SAVINGS_ACCOUNT" =
                          allocationSourceType;

                        return {
                          sourceType,
                          sourceLabel:
                            typeof typedAllocation.sourceLabel === "string"
                              ? typedAllocation.sourceLabel
                              : "Withdrawal source",
                          sourceGrossAmount:
                            typeof typedAllocation.sourceGrossAmount === "string"
                              ? typedAllocation.sourceGrossAmount
                              : "0",
                          sourcePenaltyAmount:
                            typeof typedAllocation.sourcePenaltyAmount === "string"
                              ? typedAllocation.sourcePenaltyAmount
                              : "0",
                          sourceNetAmount:
                            typeof typedAllocation.sourceNetAmount === "string"
                              ? typedAllocation.sourceNetAmount
                              : "0",
                          currency:
                            typeof typedAllocation.currency === "string"
                              ? typedAllocation.currency
                              : order.currency,
                        };
                      })
                      .filter(
                        (allocation): allocation is NonNullable<typeof allocation> =>
                          allocation !== null,
                      )
                  : undefined,
            }
          : null,
        commissionReviewStatus: commissionPayment?.reviewStatus ?? null,
        commissionSubmittedAmount:
          commissionPayment?.claimedAmount?.toString() ?? null,
        investmentOrder: order.investmentOrder
          ? {
              investmentPlan: order.investmentOrder.investmentPlan
                ? {
                    name: order.investmentOrder.investmentPlan.name,
                  }
                : null,
            }
          : null,
        investmentAccount: order.investmentAccount
          ? {
              investmentPlan: order.investmentAccount.investmentPlan
                ? {
                    name: order.investmentAccount.investmentPlan.name,
                  }
                : null,
            }
          : null,
      };
    }) ?? [];

  return (
    <WithdrawalsClient
      kycStatus={profile?.kycStatus ?? "NOT_STARTED"}
      paymentMethods={profile?.paymentMethods ?? []}
      withdrawalSources={withdrawalSources}
      withdrawalOrders={withdrawalOrders}
      availableBalance={availableBalance}
    />
  );
}
