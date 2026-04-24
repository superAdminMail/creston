"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import { approveInvestmentOrderPaymentReview } from "@/lib/payments/bank/reviewInvestmentOrderPayment";
import { approveInvestmentOrderPaymentSchema as schema } from "@/lib/zodValidations/approve-investment-order-payment";

export async function approveInvestmentOrderPayment(
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
    const data = parsed.data;
    const result = await approveInvestmentOrderPaymentReview({
      paymentId: data.paymentId,
      approvedAmount: data.approvedAmount,
      approvalMode: data.approvalMode,
      reviewNote: data.reviewNote,
      adminUserId: admin.userId,
    });

    revalidatePath("/account/dashboard/admin/investment-payments");
    revalidatePath(`/account/dashboard/admin/investment-payments/${data.paymentId}`);
    revalidatePath("/account/dashboard/admin/deposits");
    revalidatePath(
      `/account/dashboard/user/investment-orders/${result.investmentOrderId}/payment`,
    );
    revalidatePath("/account/dashboard/notifications");

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
