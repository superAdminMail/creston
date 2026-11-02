"use server";

import { revalidatePath } from "next/cache";

import {
  createErrorFormState,
  createSuccessFormState,
  getFriendlyServerError,
  type FormActionState,
} from "@/lib/forms/actionState";
import { getCurrentUserRole } from "@/lib/getCurrentUser";
import { asJsonObject, toJsonValue } from "@/lib/payments/paymentJson";
import { prisma } from "@/lib/prisma";
import { updateInvestmentOrderCapitalSchema } from "@/lib/zodValidations/update-investment-order-capital";

type FieldName = "orderId" | "allowCapitalUpdate" | "capitalUpdateReason";

export async function updateInvestmentOrderCapitalOffer(
  _previousState: FormActionState<FieldName>,
  formData: FormData,
): Promise<FormActionState<FieldName>> {
  const role = await getCurrentUserRole();

  if (role !== "SUPER_ADMIN") {
    return createErrorFormState(
      "You are not authorized to perform this action.",
    );
  }

  const parsed = updateInvestmentOrderCapitalSchema.safeParse({
    orderId: formData.get("orderId"),
    allowCapitalUpdate: formData.get("allowCapitalUpdate"),
    capitalUpdateReason: formData.get("capitalUpdateReason"),
  });

  if (!parsed.success) {
    return createErrorFormState(
      "Please review the highlighted fields.",
      parsed.error.flatten().fieldErrors,
    );
  }

  const { orderId, allowCapitalUpdate, capitalUpdateReason } = parsed.data;
  const enabled = allowCapitalUpdate === "true";

  try {
    const order = await prisma.investmentOrder.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        amount: true,
        paymentMetadata: true,
        capitalUpdateStatus: true,
      },
    });

    if (!order) {
      return createErrorFormState("Investment order not found.");
    }

    if (order.status !== "CONFIRMED") {
      return createErrorFormState(
        "Capital updates are only available for confirmed investment orders.",
      );
    }

    if (
      order.capitalUpdateStatus === "PENDING_REVIEW" ||
      order.capitalUpdateStatus === "APPROVED"
    ) {
      return createErrorFormState(
        "Capital update availability can no longer be changed after payment submission or approval.",
      );
    }

    const metadata = asJsonObject(order.paymentMetadata);

    if (enabled) {
      metadata.capitalUpdate = {
        ...asJsonObject(metadata.capitalUpdate),
        enabled: true,
        reason: capitalUpdateReason!.trim(),
      };
    } else {
      delete metadata.capitalUpdate;
    }

    await prisma.investmentOrder.update({
      where: { id: order.id },
      data: {
        capitalUpdateStatus: enabled ? "AVAILABLE" : "DISABLED",
        capitalUpdateAmount: enabled ? order.amount : null,
        capitalUpdatePaymentId: null,
        capitalUpdateRequestedAt: null,
        capitalUpdateReviewedAt: null,
        paymentMetadata: toJsonValue(metadata),
      },
    });

    const paths = [
      "/account/dashboard/admin/investment-orders",
      "/account/dashboard/super-admin/investment-orders",
      `/account/dashboard/admin/investment-orders/${orderId}`,
      "/account/dashboard/user",
      "/account/dashboard/user/investment-orders",
      `/account/dashboard/user/investment-orders/${orderId}`,
      `/account/dashboard/user/investment-orders/${orderId}/payment`,
      `/account/dashboard/user/investment-orders/${orderId}/upgrade`,
      `/account/dashboard/user/investment-orders/${orderId}/update-capital`,
    ];

    paths.forEach((path) => revalidatePath(path));

    return createSuccessFormState(
      enabled
        ? "Capital update is now available to the investor."
        : "Capital update availability has been removed.",
    );
  } catch (error) {
    return createErrorFormState(
      getFriendlyServerError(
        error,
        "Unable to update capital availability right now.",
      ),
    );
  }
}
