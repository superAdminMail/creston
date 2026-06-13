"use server";

import { Prisma, WithdrawalStatus } from "@/generated/prisma";
import { createRealtimeNotification } from "@/lib/notifications/createNotification";
import { prisma } from "@/lib/prisma";
import {
  getWithdrawalCommissionSourceType,
  readWithdrawalSnapshotString,
} from "@/lib/payments/withdrawals/withdrawalCommissionSettings";

export async function rejectWithdrawalOrder(input: {
  withdrawalId: string;
  adminUserId: string;
  rejectionReason: string;
}) {
  const withdrawal = await prisma.withdrawalOrder.findUnique({
    where: {
      id: input.withdrawalId,
    },
    select: {
      id: true,
      status: true,
      currency: true,
      rejectionReason: true,
      payoutSnapshot: true,
      investmentOrderId: true,
      investorProfile: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!withdrawal) {
    throw new Error("Withdrawal order not found.");
  }

  if (withdrawal.status !== WithdrawalStatus.PENDING) {
    throw new Error("Withdrawal orders can only be rejected while pending.");
  }

  const sourceType = getWithdrawalCommissionSourceType({
    investmentOrderId: withdrawal.investmentOrderId,
    sourceType: readWithdrawalSnapshotString(withdrawal.payoutSnapshot, "sourceType"),
  });

  const now = new Date();

  await prisma.$transaction(async (tx) => {
    const updateResult = await tx.withdrawalOrder.updateMany({
      where: {
        id: withdrawal.id,
        status: WithdrawalStatus.PENDING,
      },
      data: {
        status: WithdrawalStatus.REJECTED,
        rejectedAt: now,
        processedAt: now,
        rejectionReason: input.rejectionReason.trim(),
        commissionStatus: "VOID",
      },
    });

    if (updateResult.count === 0) {
      throw new Error("Withdrawal order can only be rejected while pending.");
    }
  });

  await createRealtimeNotification({
    userId: withdrawal.investorProfile.userId,
    event: "WITHDRAWAL",
    title: "Withdrawal request rejected",
    message: input.rejectionReason.trim()
      ? `Your withdrawal request was rejected. ${input.rejectionReason.trim()}`
      : "Your withdrawal request was rejected by the admin team.",
    link: `/account/dashboard/user/withdrawals/${withdrawal.id}`,
    key: `withdrawal-rejection:${withdrawal.id}:${now.toISOString()}`,
    metadata: {
      withdrawalId: withdrawal.id,
      sourceType,
      rejectionReason: input.rejectionReason.trim(),
      reviewedByUserId: input.adminUserId,
      rejectedAt: now.toISOString(),
    } as Prisma.InputJsonValue,
  }).catch((error) => {
    console.error("Failed to notify withdrawal rejection", error);
  });

  return {
    withdrawalId: withdrawal.id,
  };
}
