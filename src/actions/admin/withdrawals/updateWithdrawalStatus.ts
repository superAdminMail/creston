"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { WithdrawalStatus } from "@/generated/prisma";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import { prisma } from "@/lib/prisma";
import { releaseInvestmentOrdersForWithdrawal } from "@/lib/payments/withdrawals/withdrawalInvestmentOrderHolds";
import {
  canTransitionWithdrawalStatus,
  getWithdrawalStatusLifecyclePatch,
  getWithdrawalStatusSuccessMessage,
  getWithdrawalStatusTransitionError,
} from "@/lib/payments/withdrawals/withdrawalStatusWorkflow";
import { updateWithdrawalStatusSchema as schema } from "@/lib/zodValidations/update-withdrawal-status";

export async function updateWithdrawalStatusAction(
  input: z.infer<typeof schema>,
) {
  const admin = await requireDashboardRoleAccess(["ADMIN", "SUPER_ADMIN"]);

  if (!admin?.userId) {
    return { ok: false, message: "Unauthorized." };
  }

  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    const reasonError = parsed.error.flatten().fieldErrors.reason?.[0];

    return {
      ok: false,
      message: reasonError ?? "Select a valid withdrawal status.",
    };
  }

  try {
    const withdrawal = await prisma.withdrawalOrder.findUnique({
      where: {
        id: parsed.data.withdrawalId,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!withdrawal) {
      return { ok: false, message: "Withdrawal order not found." };
    }

    const nextStatus = parsed.data.status;
    const reason = parsed.data.reason ?? null;

    if (!canTransitionWithdrawalStatus(withdrawal.status, nextStatus)) {
      const transitionError = getWithdrawalStatusTransitionError(
        withdrawal.status,
        nextStatus,
      );

      return {
        ok: false,
        message:
          transitionError ??
          "This withdrawal is already in a final state and cannot be updated.",
      };
    }

    if (withdrawal.status === nextStatus) {
      return {
        ok: true,
        message: getWithdrawalStatusSuccessMessage(nextStatus),
      };
    }

    const now = new Date();
    const patch = getWithdrawalStatusLifecyclePatch(nextStatus, now, reason);

    await prisma.$transaction(async (tx) => {
      await tx.withdrawalOrder.update({
        where: {
          id: withdrawal.id,
        },
        data: patch,
      });

      if (
        nextStatus === WithdrawalStatus.REJECTED ||
        nextStatus === WithdrawalStatus.CANCELLED
      ) {
        await releaseInvestmentOrdersForWithdrawal(tx, withdrawal.id);
      }
    });

    revalidatePath("/account/dashboard/admin/Withdrawals");
    revalidatePath(`/account/dashboard/admin/Withdrawals/${withdrawal.id}`);
    revalidatePath("/account/dashboard/user/withdrawals");
    revalidatePath(`/account/dashboard/user/withdrawals/${withdrawal.id}`);
    revalidatePath("/account/dashboard/checkout");
    revalidatePath("/account/dashboard/notifications");

    return {
      ok: true,
      message: getWithdrawalStatusSuccessMessage(nextStatus),
    };
  } catch {
    return {
      ok: false,
      message: "Unable to update the withdrawal status right now.",
    };
  }
}
