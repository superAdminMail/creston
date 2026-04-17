"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import { reconcileInvestmentOrderPaymentState } from "@/app/account/dashboard/admin/investment-payments/_lib/reconcileInvestmentOrderPaymentState";

const schema = z.object({
  paymentId: z.string().min(1),
  approvedAmount: z.number().positive(),
  reviewNote: z.string().trim().max(500).optional(),
});

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

  const data = parsed.data;

  const payment = await prisma.investmentOrderPayment.findUnique({
    where: { id: data.paymentId },
    select: {
      id: true,
      status: true,
      claimedAmount: true,
      investmentOrderId: true,
      investmentOrder: {
        select: {
          id: true,
          amount: true,
          amountPaid: true,
          status: true,
        },
      },
    },
  });

  if (!payment) {
    return { ok: false, message: "Payment submission not found." };
  }
  if (payment.investmentOrder.status === "CONFIRMED") {
    return {
      ok: false,
      message:
        "This order is already confirmed and can no longer be reviewed here.",
    };
  }

  const claimedAmount = payment.claimedAmount.toNumber();
  const approvedAmount = data.approvedAmount;

  if (approvedAmount > claimedAmount) {
    return {
      ok: false,
      message: "Approved amount cannot be greater than claimed amount.",
    };
  }

  const orderAmount = payment.investmentOrder.amount.toNumber();
  const currentPaid = payment.investmentOrder.amountPaid.toNumber();
  const remaining = Math.max(orderAmount - currentPaid, 0);

  if (approvedAmount > remaining) {
    return {
      ok: false,
      message: "Approved amount cannot exceed the remaining order balance.",
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const updateResult = await tx.investmentOrderPayment.updateMany({
        where: {
          id: payment.id,
          status: "PENDING_REVIEW",
        },
        data: {
          status: "APPROVED",
          approvedAmount,
          reviewNote: data.reviewNote || null,
          rejectionReason: null,
          reviewedAt: new Date(),
          reviewedByUserId: admin.userId,
        },
      });

      if (updateResult.count === 0) {
        throw new Error("This payment submission has already been reviewed.");
      }

      await reconcileInvestmentOrderPaymentState(tx, payment.investmentOrderId);
    });

    revalidatePath("/account/dashboard/admin/investment-payments");
    revalidatePath(`/account/dashboard/admin/investment-payments/${payment.id}`);
    revalidatePath(
      `/account/dashboard/user/investment-orders/${payment.investmentOrderId}/payment`,
    );

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
