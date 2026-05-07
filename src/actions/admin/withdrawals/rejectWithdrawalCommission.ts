"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import { rejectWithdrawalCommissionReview } from "@/lib/payments/withdrawals/reviewWithdrawalCommission";
import { rejectWithdrawalCommissionSchema as schema } from "@/lib/zodValidations/reject-withdrawal-commission";

export async function rejectWithdrawalCommission(
  input: z.infer<typeof schema>,
) {
  const admin = await requireDashboardRoleAccess(["ADMIN", "SUPER_ADMIN"]);

  if (!admin?.userId) {
    return { ok: false, message: "Unauthorized." };
  }

  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: "Rejection reason is required." };
  }

  try {
    const result = await rejectWithdrawalCommissionReview({
      withdrawalId: parsed.data.withdrawalId,
      rejectionReason: parsed.data.rejectionReason,
      reviewNote: parsed.data.reviewNote,
      adminUserId: admin.userId,
    });

    revalidatePath("/account/dashboard/admin/Withdrawals");
    revalidatePath(`/account/dashboard/admin/Withdrawals/${result.withdrawalId}`);
    revalidatePath("/account/dashboard/user/withdrawals");
    revalidatePath(`/account/dashboard/user/withdrawals/${result.withdrawalId}`);
    revalidatePath("/account/dashboard/checkout");
    revalidatePath("/account/dashboard/notifications");

    return {
      ok: true,
      message: "Withdrawal commission proof rejected.",
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to reject this withdrawal commission right now.",
    };
  }
}
