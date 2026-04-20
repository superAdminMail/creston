"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import { approveSavingsTransactionPaymentReview } from "@/lib/payments/bank/reviewSavingsTransactionPayment";

const schema = z.object({
  paymentId: z.string().min(1),
  approvedAmount: z.number().positive(),
  reviewNote: z.string().trim().max(500).optional(),
});

export async function approveSavingsTransactionPayment(
  input: z.infer<typeof schema>,
) {
  const admin = await requireDashboardRoleAccess(["ADMIN", "SUPER_ADMIN"]);

  if (!admin?.userId) {
    return { ok: false, message: "Unauthorized." };
  }

  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: "Invalid approval payload." };
  }

  try {
    await approveSavingsTransactionPaymentReview({
      paymentId: parsed.data.paymentId,
      approvedAmount: parsed.data.approvedAmount,
      reviewNote: parsed.data.reviewNote,
      adminUserId: admin.userId,
    });

    revalidatePath("/account/dashboard/admin/savings-payments");
    revalidatePath(`/account/dashboard/admin/savings-payments/${parsed.data.paymentId}`);
    revalidatePath("/account/dashboard/admin/deposits");
    revalidatePath("/account/dashboard/user/savings");
    revalidatePath("/account/dashboard/checkout");

    return {
      ok: true,
      message: "Payment submission approved successfully.",
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to approve this payment right now.",
    };
  }
}
