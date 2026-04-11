"use server";

import { InvestmentOrderStatus } from "@/generated/prisma";
import {
  createErrorFormState,
  createSuccessFormState,
  getFriendlyServerError,
  type FormActionState,
} from "@/lib/forms/actionState";
import { prisma } from "@/lib/prisma";

import { assertAdminInvestmentOrderAccess } from "./adminInvestmentOrder.shared";

type FieldName = "orderId" | "reason" | "adminNotes";

export async function cancelAdminInvestmentOrder(
  _previousState: FormActionState<FieldName>,
  formData: FormData,
): Promise<FormActionState<FieldName>> {
  await assertAdminInvestmentOrderAccess();

  const orderId = formData.get("orderId");
  const reason = formData.get("reason");
  const adminNotes = formData.get("adminNotes");

  if (!orderId || typeof orderId !== "string") {
    return createErrorFormState("Invalid investment order.");
  }

  if (!reason || typeof reason !== "string" || !reason.trim()) {
    return createErrorFormState("Cancellation reason is required.", {
      reason: ["Cancellation reason is required."],
    });
  }

  const existingOrder = await prisma.investmentOrder.findUnique({
    where: { id: orderId },
    select: {
      status: true,
    },
  });

  if (!existingOrder) {
    return createErrorFormState("Investment order not found.");
  }

  if (existingOrder.status !== InvestmentOrderStatus.PENDING_PAYMENT) {
    return createErrorFormState(
      "Only pending payment investment orders can be cancelled from this screen.",
    );
  }

  try {
    await prisma.investmentOrder.update({
      where: { id: orderId },
      data: {
        status: InvestmentOrderStatus.CANCELLED,
        cancelledAt: new Date(),
        cancellationReason: reason.trim(),
        adminNotes:
          typeof adminNotes === "string" && adminNotes.trim()
            ? adminNotes.trim()
            : null,
      },
    });

    return createSuccessFormState("Investment order cancelled successfully.");
  } catch (error) {
    return createErrorFormState(
      getFriendlyServerError(
        error,
        "Unable to cancel this investment order right now.",
      ),
    );
  }
}
