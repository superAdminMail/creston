"use server";

import { Prisma } from "@/generated/prisma";
import { revalidatePath } from "next/cache";

import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";
import { prisma } from "@/lib/prisma";
import { asJsonObject, toNullableJsonValue } from "@/lib/payments/paymentJson";
import {
  isSystemHealthProofDismissed,
  markSystemHealthProofDismissed,
} from "@/lib/system-health/submittedProofCleanup";

export type SubmittedPaymentProofCleanupMode = "selected" | "all";

type SubmittedPaymentProofReference =
  | {
      sourceType: "INVESTMENT_ORDER";
      paymentId: string;
    }
  | {
      sourceType: "SAVINGS_ACCOUNT";
      paymentId: string;
    };

function parseSubmittedPaymentProofId(
  value: string,
): SubmittedPaymentProofReference | null {
  if (value.startsWith("investment:")) {
    const paymentId = value.slice("investment:".length).trim();

    return paymentId
      ? {
          sourceType: "INVESTMENT_ORDER",
          paymentId,
        }
      : null;
  }

  if (value.startsWith("savings:")) {
    const paymentId = value.slice("savings:".length).trim();

    return paymentId
      ? {
          sourceType: "SAVINGS_ACCOUNT",
          paymentId,
        }
      : null;
  }

  return null;
}

function cleanupInvestmentPaymentMetadata(
  paymentMetadata: unknown,
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput {
  const metadata = asJsonObject(paymentMetadata);
  const nextMetadata = { ...metadata };

  delete nextMetadata.provider;
  delete nextMetadata.paymentId;
  delete nextMetadata.paymentMode;
  delete nextMetadata.proofMode;
  delete nextMetadata.splitNumber;
  delete nextMetadata.remainingBeforeCharge;

  if (Object.keys(nextMetadata).length === 0) {
    return Prisma.JsonNull;
  }

  return toNullableJsonValue(nextMetadata) ?? Prisma.JsonNull;
}

function getLatestPaymentReference(payment: {
  id: string;
  transferReference: string | null;
}) {
  return payment.transferReference?.trim() || payment.id;
}

export async function clearSubmittedPaymentProofs(input: {
  mode: SubmittedPaymentProofCleanupMode;
  proofIds?: string[];
}) {
  const { userId: superAdminUserId } = await requireSuperAdminAccess();

  const mode = input.mode;
  const proofIds =
    input.proofIds?.map((id) => id.trim()).filter(Boolean) ?? [];

  if (mode === "selected" && proofIds.length === 0) {
    return {
      error: "Select at least one submitted proof before clearing it.",
    };
  }

  const selectedProofRefs =
    mode === "selected"
      ? proofIds.map(parseSubmittedPaymentProofId).filter(
          (value): value is SubmittedPaymentProofReference => value !== null,
        )
      : [];
  const selectedInvestmentPaymentIds = selectedProofRefs
    .filter((item) => item.sourceType === "INVESTMENT_ORDER")
    .map((item) => item.paymentId);
  const selectedSavingsPaymentIds = selectedProofRefs
    .filter((item) => item.sourceType === "SAVINGS_ACCOUNT")
    .map((item) => item.paymentId);

  if (mode === "selected" && selectedProofRefs.length === 0) {
    return {
      error: "Select at least one submitted proof before clearing it.",
    };
  }

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const investmentPayments =
          mode === "all"
            ? await tx.investmentOrderPayment.findMany({
                where: {
                  status: {
                    in: ["PENDING_REVIEW", "APPROVED", "REJECTED", "CANCELED"],
                  },
                },
                select: {
                  id: true,
                  status: true,
                  submissionKind: true,
                  investmentOrderId: true,
                  metadata: true,
                  investmentOrder: {
                    select: {
                      paymentMetadata: true,
                    },
                  },
                },
              })
            : await tx.investmentOrderPayment.findMany({
                where: {
                  id: {
                    in: selectedInvestmentPaymentIds,
                  },
                  status: {
                    in: ["PENDING_REVIEW", "APPROVED", "REJECTED", "CANCELED"],
                  },
                },
                select: {
                  id: true,
                  status: true,
                  submissionKind: true,
                  investmentOrderId: true,
                  metadata: true,
                  investmentOrder: {
                    select: {
                      paymentMetadata: true,
                    },
                  },
                },
              });

        const savingsPayments =
          mode === "all"
            ? await tx.savingsTransactionPayment.findMany({
                where: {
                  status: {
                    in: ["PENDING_REVIEW", "APPROVED", "REJECTED", "CANCELED"],
                  },
                },
                select: {
                  id: true,
                  status: true,
                  savingsFundingIntentId: true,
                  metadata: true,
                },
              })
            : await tx.savingsTransactionPayment.findMany({
                where: {
                  id: {
                    in: selectedSavingsPaymentIds,
                  },
                  status: {
                    in: ["PENDING_REVIEW", "APPROVED", "REJECTED", "CANCELED"],
                  },
                },
                select: {
                  id: true,
                  status: true,
                  savingsFundingIntentId: true,
                  metadata: true,
                },
              });

        const visibleInvestmentPayments = investmentPayments.filter(
          (payment) => !isSystemHealthProofDismissed(payment.metadata),
        );
        const visibleSavingsPayments = savingsPayments.filter(
          (payment) => !isSystemHealthProofDismissed(payment.metadata),
        );

        if (
          visibleInvestmentPayments.length + visibleSavingsPayments.length === 0
        ) {
          throw new Error("No visible submitted payment proofs were found.");
        }

        const revalidatePaths = new Set<string>([
          "/account/dashboard/super-admin/system-health",
          "/account/dashboard/notifications",
          "/account/dashboard/admin/investment-payments",
          "/account/dashboard/admin/savings-payments",
          "/account/dashboard/checkout",
          "/account/dashboard/user",
          "/account/dashboard/user/investment-orders",
          "/account/dashboard/user/savings",
        ]);

        const pendingInvestmentPayments = visibleInvestmentPayments.filter(
          (payment) => payment.status === "PENDING_REVIEW",
        );
        const reviewableInvestmentPayments = visibleInvestmentPayments.filter(
          (payment) => payment.status !== "PENDING_REVIEW",
        );
        const pendingSavingsPayments = visibleSavingsPayments.filter(
          (payment) => payment.status === "PENDING_REVIEW",
        );
        const reviewableSavingsPayments = visibleSavingsPayments.filter(
          (payment) => payment.status !== "PENDING_REVIEW",
        );

        for (const payment of pendingInvestmentPayments) {
          await tx.notification.deleteMany({
            where: {
              key: {
                startsWith: `investment-order-bank-deposit-submitted:${payment.id}:`,
              },
            },
          });

          const latestApprovedPayment = await tx.investmentOrderPayment.findFirst({
            where: {
              investmentOrderId: payment.investmentOrderId,
              status: "APPROVED",
            },
            orderBy: {
              reviewedAt: "desc",
            },
            select: {
              id: true,
              transferReference: true,
              submittedAt: true,
            },
          });

          await tx.investmentOrder.update({
            where: {
              id: payment.investmentOrderId,
            },
            data: {
              paymentReference: latestApprovedPayment
                ? getLatestPaymentReference(latestApprovedPayment)
                : null,
              lastPaymentSubmittedAt:
                latestApprovedPayment?.submittedAt ?? null,
              paymentMetadata: cleanupInvestmentPaymentMetadata(
                payment.investmentOrder.paymentMetadata,
              ),
              ...(payment.submissionKind === "UPGRADE"
                ? {
                    upgradeStatus: "AVAILABLE",
                    upgradePaymentId: null,
                    upgradeRequestedAt: null,
                    upgradeReviewedAt: null,
                  }
                : {}),
            },
          });

          await tx.investmentOrderPayment.deleteMany({
            where: {
              id: payment.id,
              status: "PENDING_REVIEW",
            },
          });

          revalidatePaths.add(
            `/account/dashboard/admin/investment-payments/${payment.id}`,
          );
          revalidatePaths.add(
            `/account/dashboard/user/investment-orders/${payment.investmentOrderId}`,
          );
          revalidatePaths.add(
            `/account/dashboard/user/investment-orders/${payment.investmentOrderId}/payment`,
          );
          revalidatePaths.add(
            `/account/dashboard/user/investment-orders/${payment.investmentOrderId}/upgrade`,
          );
        }

        for (const payment of reviewableInvestmentPayments) {
          await tx.investmentOrderPayment.updateMany({
            where: {
              id: payment.id,
            },
            data: {
              metadata: markSystemHealthProofDismissed(payment.metadata, {
                dismissedAt: new Date().toISOString(),
                dismissedByUserId: superAdminUserId,
              }),
            },
          });

          revalidatePaths.add(
            `/account/dashboard/admin/investment-payments/${payment.id}`,
          );
        }

        for (const payment of pendingSavingsPayments) {
          await tx.notification.deleteMany({
            where: {
              AND: [
                {
                  key: {
                    startsWith: "savings-funding-",
                  },
                },
                {
                  key: {
                    contains: `:${payment.id}:`,
                  },
                },
              ],
            },
          });

          await tx.savingsFundingIntent.deleteMany({
            where: {
              id: payment.savingsFundingIntentId,
            },
          });

          revalidatePaths.add(
            `/account/dashboard/admin/savings-payments/${payment.id}`,
          );
        }

        for (const payment of reviewableSavingsPayments) {
          await tx.savingsTransactionPayment.updateMany({
            where: {
              id: payment.id,
            },
            data: {
              metadata: markSystemHealthProofDismissed(payment.metadata, {
                dismissedAt: new Date().toISOString(),
                dismissedByUserId: superAdminUserId,
              }),
            },
          });

          revalidatePaths.add(
            `/account/dashboard/admin/savings-payments/${payment.id}`,
          );
        }

        return {
          deletedCount:
            pendingInvestmentPayments.length + pendingSavingsPayments.length,
          hiddenCount:
            reviewableInvestmentPayments.length + reviewableSavingsPayments.length,
          investmentDeletedCount: pendingInvestmentPayments.length,
          savingsDeletedCount: pendingSavingsPayments.length,
          investmentHiddenCount: reviewableInvestmentPayments.length,
          savingsHiddenCount: reviewableSavingsPayments.length,
          revalidatePaths: Array.from(revalidatePaths),
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    for (const path of result.revalidatePaths) {
      revalidatePath(path);
    }

    return {
      success: true,
      ...result,
    };
  } catch (error) {
    console.error("Failed to clear submitted payment proofs", error);

    return {
      error: "Unable to clear submitted payment proofs right now.",
    };
  }
}
