"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { Prisma } from "@/generated/prisma";
import { getFriendlyServerError } from "@/lib/forms/actionState";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import { rejectSavingsTransactionPaymentReview } from "@/lib/payments/bank/reviewSavingsTransactionPayment";
import { rejectSavingsTransactionPaymentSchema as schema } from "@/lib/zodValidations/reject-savings-transaction-payment";

export async function rejectSavingsTransactionPayment(
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

  try {
    await rejectSavingsTransactionPaymentReview({
      paymentId: parsed.data.paymentId,
      rejectionReason: parsed.data.rejectionReason,
      reviewNote: parsed.data.reviewNote,
      adminUserId: admin.userId,
    });

    revalidatePath("/account/dashboard/admin/savings-payments");
    revalidatePath(`/account/dashboard/admin/savings-payments/${parsed.data.paymentId}`);
    revalidatePath("/account/dashboard/admin/deposits");
    revalidatePath("/account/dashboard/user/savings");
    revalidatePath("/account/dashboard/checkout");
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
