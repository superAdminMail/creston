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
import { asJsonObject, toJsonValue } from "@/lib/payments/paymentJson";

import {
  assertAdminInvestmentOrderAccess,
  canPauseInvestmentOrderRuntimeStatus,
} from "./adminInvestmentOrder.shared";

type FieldName = "orderId" | "allowUpgrade" | "upgradeAmount";

export async function pauseAdminInvestmentOrder(
  _previousState: FormActionState<FieldName>,
  formData: FormData,
): Promise<FormActionState<FieldName>> {
  await assertAdminInvestmentOrderAccess();

  const orderId = formData.get("orderId");
  const allowUpgrade = formData.get("allowUpgrade") === "true";
  const upgradeAmountRaw = formData.get("upgradeAmount");
  const upgradeAmount =
    typeof upgradeAmountRaw === "string" && upgradeAmountRaw.trim().length > 0
      ? Number(upgradeAmountRaw)
      : null;

  if (!orderId || typeof orderId !== "string") {
    return createErrorFormState("Invalid investment order.");
  }

  if (
    allowUpgrade &&
    (upgradeAmount === null || !Number.isFinite(upgradeAmount) || upgradeAmount <= 0)
  ) {
    return createErrorFormState(
      "Please review the highlighted fields.",
      {
        upgradeAmount: [
          "Enter a valid upgrade amount greater than zero.",
        ],
      },
    );
  }

  try {
    const existingOrder = await prisma.investmentOrder.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        runtimeStatus: true,
        paymentMetadata: true,
      },
    });

    if (!existingOrder) {
      return createErrorFormState("Investment order not found.");
    }

    if (
      !canPauseInvestmentOrderRuntimeStatus(
        existingOrder.status,
        existingOrder.runtimeStatus,
      )
    ) {
      return createErrorFormState(
        "Only active confirmed investment orders can be paused.",
      );
    }

    await prisma.investmentOrder.update({
      where: { id: existingOrder.id },
      data: {
        runtimeStatus: RuntimeStatus.PAUSED,
        upgradeStatus: allowUpgrade ? "AVAILABLE" : "DISABLED",
        upgradeAmount: allowUpgrade ? upgradeAmount : null,
        upgradePaymentId: null,
        upgradeRequestedAt: null,
        upgradeReviewedAt: null,
        paymentMetadata: (() => {
          const metadata = asJsonObject(existingOrder.paymentMetadata);
          delete metadata.upgrade;
          return toJsonValue(metadata);
        })(),
      },
    });

    revalidatePath("/account/dashboard/admin/investment-orders");
    revalidatePath(`/account/dashboard/admin/investment-orders/${orderId}`);
    revalidatePath("/account/dashboard/user/investment-orders");
    revalidatePath(`/account/dashboard/user/investment-orders/${orderId}`);
    revalidatePath(`/account/dashboard/user/investment-orders/${orderId}/upgrade`);
    revalidatePath(`/account/dashboard/user/investment-orders/${orderId}/payment`);

    return createSuccessFormState("Investment order paused successfully.");
  } catch (error) {
    return createErrorFormState(
      getFriendlyServerError(
        error,
        "Unable to pause this investment order right now.",
      ),
    );
  }
}
