"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import { rejectWithdrawalOrder } from "@/lib/payments/withdrawals/rejectWithdrawalOrder";
import { rejectWithdrawalOrderSchema as schema } from "@/lib/zodValidations/reject-withdrawal-order";

export async function rejectWithdrawalOrderAction(
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
    const result = await rejectWithdrawalOrder({
      withdrawalId: parsed.data.withdrawalId,
      rejectionReason: parsed.data.rejectionReason,
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
      message: "Withdrawal request rejected successfully.",
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to reject this withdrawal request right now.",
    };
  }
}
