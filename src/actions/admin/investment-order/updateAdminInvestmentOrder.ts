"use server";

import { InvestmentOrderStatus } from "@/generated/prisma";
import {
  createErrorFormState,
  createSuccessFormState,
  createValidationErrorState,
  getFriendlyServerError,
  type FormActionState,
} from "@/lib/forms/actionState";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

import { assertAdminInvestmentOrderAccess } from "./adminInvestmentOrder.shared";

type FieldName = "status" | "paymentReference" | "adminNotes" | "cancellationReason";

const updateAdminInvestmentOrderSchema = z.object({
  orderId: z.string().trim().min(1, "Order is required."),
  status: z.nativeEnum(InvestmentOrderStatus),
  paymentReference: z.string().trim().max(120, "Reference is too long.").optional().or(z.literal("")),
  adminNotes: z.string().trim().max(500, "Admin notes must be 500 characters or fewer.").optional().or(z.literal("")),
  cancellationReason: z
    .string()
    .trim()
    .max(500, "Cancellation reason must be 500 characters or fewer.")
    .optional()
    .or(z.literal("")),
});

export async function updateAdminInvestmentOrder(
  _previousState: FormActionState<FieldName>,
  formData: FormData,
): Promise<FormActionState<FieldName>> {
  await assertAdminInvestmentOrderAccess();

  const parsed = updateAdminInvestmentOrderSchema.safeParse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
    paymentReference: formData.get("paymentReference"),
    adminNotes: formData.get("adminNotes"),
    cancellationReason: formData.get("cancellationReason"),
  });

  if (!parsed.success) {
    return createValidationErrorState(
      parsed.error.flatten().fieldErrors as Record<FieldName, string[]>,
      "Please review the highlighted fields.",
    );
  }

  const values = parsed.data;

  try {
    const existingOrder = await prisma.investmentOrder.findUnique({
      where: { id: values.orderId },
      select: { status: true },
    });

    if (!existingOrder) {
      return createErrorFormState("Investment order not found.");
    }

    if (
      values.status === InvestmentOrderStatus.CONFIRMED &&
      existingOrder.status !== InvestmentOrderStatus.CONFIRMED
    ) {
      return createErrorFormState(
        "Use the confirm button on the order details page to confirm this order.",
      );
    }

    await prisma.investmentOrder.update({
      where: { id: values.orderId },
      data: {
        status: values.status,
        paymentReference: values.paymentReference || null,
        adminNotes: values.adminNotes || null,
        cancellationReason: values.cancellationReason || null,
      },
    });

    return createSuccessFormState("Investment order updated successfully.");
  } catch (error) {
    return createErrorFormState(
      getFriendlyServerError(
        error,
        "Unable to update this investment order right now.",
      ),
    );
  }
}
