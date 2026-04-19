"use server";

import { revalidatePath } from "next/cache";

import { InvestmentOrderStatus } from "@/generated/prisma";
import {
  createErrorFormState,
  createSuccessFormState,
  getFriendlyServerError,
  type FormActionState,
} from "@/lib/forms/actionState";
import { prisma } from "@/lib/prisma";

import { assertAdminInvestmentOrderAccess } from "./adminInvestmentOrder.shared";
import {
  getAdminInvestmentOrderNotificationContext,
  notifyInvestorAboutAdminInvestmentOrderRejection,
} from "./adminInvestmentOrderNotifications";

type FieldName = "orderId" | "reason" | "adminNotes";

export async function rejectAdminInvestmentOrder(
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
    return createErrorFormState("Rejection reason is required.", {
      reason: ["Rejection reason is required."],
    });
  }

  const existingOrder = await getAdminInvestmentOrderNotificationContext(orderId);

  if (!existingOrder) {
    return createErrorFormState("Investment order not found.");
  }

  if (existingOrder.status !== InvestmentOrderStatus.PENDING_PAYMENT) {
    return createErrorFormState(
      "Only pending payment investment orders can be rejected from this screen.",
    );
  }

  try {
    await prisma.investmentOrder.update({
      where: { id: orderId },
      data: {
        status: InvestmentOrderStatus.REJECTED,
        cancellationReason: reason.trim(),
        adminNotes:
          typeof adminNotes === "string" && adminNotes.trim()
            ? adminNotes.trim()
            : null,
      },
    });

    await notifyInvestorAboutAdminInvestmentOrderRejection(existingOrder);

    revalidatePath("/account/dashboard/admin/investment-orders");
    revalidatePath(`/account/dashboard/admin/investment-orders/${orderId}`);
    revalidatePath("/account/dashboard/user/investment-orders");
    revalidatePath(`/account/dashboard/user/investment-orders/${orderId}`);
    revalidatePath(`/account/dashboard/user/investment-orders/${orderId}/payment`);
    revalidatePath("/account/dashboard/notifications");

    return createSuccessFormState("Investment order rejected successfully.");
  } catch (error) {
    return createErrorFormState(
      getFriendlyServerError(
        error,
        "Unable to reject this investment order right now.",
      ),
    );
  }
}

export { rejectAdminInvestmentOrder as deleteAdminInvestmentOrder };
