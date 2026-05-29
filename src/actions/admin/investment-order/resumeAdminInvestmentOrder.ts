"use server";

import { revalidatePath } from "next/cache";

import { RuntimeStatus } from "@/generated/prisma";
import {
  createErrorFormState,
  createSuccessFormState,
  getFriendlyServerError,
  type FormActionState,
} from "@/lib/forms/actionState";
import { prisma } from "@/lib/prisma";

import {
  assertAdminInvestmentOrderAccess,
  canResumeInvestmentOrderRuntimeStatus,
} from "./adminInvestmentOrder.shared";

type FieldName = "orderId";

export async function resumeAdminInvestmentOrder(
  _previousState: FormActionState<FieldName>,
  formData: FormData,
): Promise<FormActionState<FieldName>> {
  await assertAdminInvestmentOrderAccess();

  const orderId = formData.get("orderId");

  if (!orderId || typeof orderId !== "string") {
    return createErrorFormState("Invalid investment order.");
  }

  try {
    const existingOrder = await prisma.investmentOrder.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        runtimeStatus: true,
      },
    });

    if (!existingOrder) {
      return createErrorFormState("Investment order not found.");
    }

    if (
      !canResumeInvestmentOrderRuntimeStatus(
        existingOrder.status,
        existingOrder.runtimeStatus,
      )
    ) {
      return createErrorFormState(
        "Only paused confirmed investment orders can be resumed.",
      );
    }

    await prisma.investmentOrder.update({
      where: { id: existingOrder.id },
      data: {
        runtimeStatus: RuntimeStatus.ONGOING,
      },
    });

    revalidatePath("/account/dashboard/admin/investment-orders");
    revalidatePath(`/account/dashboard/admin/investment-orders/${orderId}`);
    revalidatePath("/account/dashboard/user/investment-orders");
    revalidatePath(`/account/dashboard/user/investment-orders/${orderId}`);
    revalidatePath(`/account/dashboard/user/investment-orders/${orderId}/payment`);

    return createSuccessFormState("Investment order resumed successfully.");
  } catch (error) {
    return createErrorFormState(
      getFriendlyServerError(
        error,
        "Unable to resume this investment order right now.",
      ),
    );
  }
}
