"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { Prisma } from "@/generated/prisma";
import { getFriendlyServerError } from "@/lib/forms/actionState";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import { rejectInvestmentOrderPaymentReview } from "@/lib/payments/bank/reviewInvestmentOrderPayment";

const schema = z.object({
  paymentId: z.string().min(1),
  rejectionReason: z.string().trim().min(1).max(500),
  reviewNote: z.string().trim().max(500).optional(),
});

export async function rejectInvestmentOrderPayment(
  input: z.infer<typeof schema>,
) {
  const admin = await requireDashboardRoleAccess(["ADMIN", "SUPER_ADMIN"]);

  if (!admin?.userId) {
    return { ok: false, message: "Unauthorized." };
  }

  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Rejection reason is required.",
    };
  }

  const data = parsed.data;

  try {
    const result = await rejectInvestmentOrderPaymentReview({
      paymentId: data.paymentId,
      rejectionReason: data.rejectionReason,
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
      message: "Payment submission rejected.",
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Prisma.PrismaClientKnownRequestError
          ? getFriendlyServerError(
              error,
              "Unable to reject this payment right now.",
            )
          : error instanceof Error
            ? error.message
            : "Unable to reject this payment right now.",
    };
  }
}
