"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import { reconcileInvestmentOrderPaymentState } from "@/app/account/dashboard/admin/investment-payments/_lib/reconcileInvestmentOrderPaymentState";

const schema = z.object({
  paymentId: z.string().min(1),
  rejectionReason: z.string().trim().min(3).max(500),
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
    return { ok: false, message: "Invalid rejection payload." };
  }

  const data = parsed.data;

  const payment = await prisma.investmentOrderPayment.findUnique({
    where: { id: data.paymentId },
    select: {
      id: true,
      investmentOrderId: true,
    },
  });

  if (!payment) {
    return { ok: false, message: "Payment submission not found." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.investmentOrderPayment.update({
      where: { id: payment.id },
      data: {
        status: "REJECTED",
        approvedAmount: null,
        rejectionReason: data.rejectionReason,
        reviewNote: data.reviewNote || null,
        reviewedAt: new Date(),
        reviewedByUserId: admin.userId,
      },
    });

    await reconcileInvestmentOrderPaymentState(tx, payment.investmentOrderId);
  });

  revalidatePath("/account/dashboard/admin/investment-payments");
  revalidatePath(`/account/dashboard/admin/investment-payments/${payment.id}`);
  revalidatePath(
    `/account/dashboard/user/investment-orders/${payment.investmentOrderId}/payment`,
  );

  return {
    ok: true,
    message: "Payment submission rejected.",
  };
}
