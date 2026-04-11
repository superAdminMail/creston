"use server";

import {
  createErrorFormState,
  createSuccessFormState,
  getFriendlyServerError,
  type FormActionState,
} from "@/lib/forms/actionState";
import { prisma } from "@/lib/prisma";

import { assertAdminInvestmentOrderAccess } from "./adminInvestmentOrder.shared";

type FieldName = "orderId" | "reason" | "adminNotes";

export async function deleteAdminInvestmentOrder(
  _previousState: FormActionState<FieldName>,
  formData: FormData,
): Promise<FormActionState<FieldName>> {
  await assertAdminInvestmentOrderAccess();

  const orderId = formData.get("orderId");
  const reason = formData.get("reason");

  if (!orderId || typeof orderId !== "string") {
    return createErrorFormState("Invalid investment order.");
  }

  if (!reason || typeof reason !== "string" || !reason.trim()) {
    return createErrorFormState("Delete reason is required.", {
      reason: ["Delete reason is required."],
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

  if (existingOrder.status !== "PENDING_PAYMENT") {
    return createErrorFormState(
      "Only pending payment investment orders can be deleted from this screen.",
    );
  }

  try {
    await prisma.investmentOrder.delete({
      where: { id: orderId },
    });

    return createSuccessFormState("Investment order deleted successfully.");
  } catch (error) {
    return createErrorFormState(
      getFriendlyServerError(
        error,
        "Unable to delete this investment order right now.",
      ),
    );
  }
}
