"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import { approveWithdrawalFeeReview } from "@/lib/payments/withdrawals/reviewWithdrawalFee";
import { approveWithdrawalFeeSchema as schema } from "@/lib/zodValidations/approve-withdrawal-fee";

export async function approveWithdrawalFee(input: z.infer<typeof schema>) {
  const admin = await requireDashboardRoleAccess(["SUPER_ADMIN"]);

  if (!admin?.userId) {
    return { ok: false, message: "Unauthorized." };
  }

  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: "Invalid fee approval payload." };
  }

  try {
    const result = await approveWithdrawalFeeReview({
      withdrawalId: parsed.data.withdrawalId,
      approvedAmount: parsed.data.approvedAmount,
      approvalMode: parsed.data.approvalMode,
      reviewNote: parsed.data.reviewNote,
      adminUserId: admin.userId,
    });

    revalidatePath("/account/dashboard/admin/Withdrawals");
    revalidatePath(`/account/dashboard/admin/Withdrawals/${result.withdrawalId}`);
    revalidatePath("/account/dashboard/super-admin/withdrawals");
    revalidatePath(
      `/account/dashboard/super-admin/withdrawals/${result.withdrawalId}`,
    );
    revalidatePath("/account/dashboard/user/withdrawals");
    revalidatePath(`/account/dashboard/user/withdrawals/${result.withdrawalId}`);
    revalidatePath("/account/dashboard/checkout");
    revalidatePath("/account/dashboard/notifications");

    return {
      ok: true,
      message: "Withdrawal applied fee proof approved successfully.",
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to approve this withdrawal fee right now.",
    };
  }
}
