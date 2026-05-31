"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getFriendlyServerError } from "@/lib/forms/actionState";
import { prisma } from "@/lib/prisma";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import {
  canTransitionWithdrawalCommissionStatus,
  getWithdrawalCommissionStatusSuccessMessage,
  getWithdrawalCommissionStatusTransitionError,
} from "@/lib/payments/withdrawals/withdrawalCommissionStatusWorkflow";
import { updateWithdrawalCommissionStatusSchema as schema } from "@/lib/zodValidations/update-withdrawal-commission-status";

export async function updateWithdrawalCommissionStatusAction(
  input: z.infer<typeof schema>,
) {
  const admin = await requireDashboardRoleAccess(["ADMIN", "SUPER_ADMIN"]);

  if (!admin?.userId) {
    return { ok: false, message: "Unauthorized." };
  }

  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: "Invalid commission status payload." };
  }

  try {
    const withdrawal = await prisma.withdrawalOrder.findUnique({
      where: {
        id: parsed.data.withdrawalId,
      },
      select: {
        id: true,
        commissionStatus: true,
      },
    });

    if (!withdrawal) {
      return { ok: false, message: "Withdrawal order not found." };
    }

    const transitionError = getWithdrawalCommissionStatusTransitionError(
      withdrawal.commissionStatus,
      parsed.data.status,
    );

    if (transitionError) {
      return { ok: false, message: transitionError };
    }

    if (
      !canTransitionWithdrawalCommissionStatus(
        withdrawal.commissionStatus,
        parsed.data.status,
      )
    ) {
      return {
        ok: false,
        message: "This commission status can no longer be updated.",
      };
    }

    await prisma.withdrawalOrder.update({
      where: {
        id: withdrawal.id,
      },
      data: {
        commissionStatus: parsed.data.status,
      },
    });

    revalidatePath("/account/dashboard/admin/Withdrawals");
    revalidatePath(`/account/dashboard/admin/Withdrawals/${withdrawal.id}`);
    revalidatePath("/account/dashboard/user/withdrawals");
    revalidatePath(`/account/dashboard/user/withdrawals/${withdrawal.id}`);
    revalidatePath("/account/dashboard/checkout");

    return {
      ok: true,
      message: getWithdrawalCommissionStatusSuccessMessage(parsed.data.status),
    };
  } catch (error) {
    return {
      ok: false,
      message: getFriendlyServerError(
        error,
        "Unable to update this commission status right now.",
      ),
    };
  }
}
