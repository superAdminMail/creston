"use server";

import { revalidatePath } from "next/cache";

import { WithdrawalStatus } from "@/generated/prisma";
import {
  createErrorFormState,
  createSuccessFormState,
  createValidationErrorState,
  getFriendlyServerError,
  type FormActionState,
} from "@/lib/forms/actionState";
import { createRealtimeNotification } from "@/lib/notifications/createNotification";
import { prisma } from "@/lib/prisma";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import { decimalToNumber, toDecimal } from "@/lib/services/investment/decimal";
import { buildWithdrawalCommissionCheckoutUrl } from "@/lib/withdrawals/withdrawalCommissionCheckout";
import {
  updateWithdrawalCommissionSchema,
} from "@/lib/zodValidations/update-withdrawal-commission";

type FieldName = "withdrawalId" | "hasCommissionFees" | "commissionPercent";

export type UpdateWithdrawalCommissionState = FormActionState<FieldName>;

function buildNotificationMessage(
  hasCommissionFees: boolean,
  commissionPercent: string | null,
) {
  if (!hasCommissionFees) {
    return "Withdrawal commission has been removed from your withdrawal order.";
  }

  return `Withdrawal commission has been updated to ${commissionPercent ?? "0"}%.`;
}

export async function updateWithdrawalCommission(
  _previousState: UpdateWithdrawalCommissionState,
  formData: FormData,
): Promise<UpdateWithdrawalCommissionState> {
  await requireDashboardRoleAccess(["ADMIN", "SUPER_ADMIN"]);

  const parsed = updateWithdrawalCommissionSchema.safeParse({
    withdrawalId: formData.get("withdrawalId"),
    hasCommissionFees: formData.get("hasCommissionFees"),
    commissionPercent: formData.get("commissionPercent"),
  });

  if (!parsed.success) {
    return createValidationErrorState(
      parsed.error.flatten().fieldErrors as Record<FieldName, string[]>,
      "Please review the commission settings.",
    );
  }

  try {
    const withdrawal = await prisma.withdrawalOrder.findUnique({
      where: {
        id: parsed.data.withdrawalId,
      },
      select: {
        id: true,
        status: true,
        amount: true,
        currency: true,
        investorProfile: {
          select: {
            user: {
              select: {
                id: true,
              },
            },
          },
        },
        investmentOrder: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!withdrawal) {
      return createErrorFormState("Withdrawal order not found.");
    }

    if (withdrawal.status !== WithdrawalStatus.PENDING) {
      return createErrorFormState(
        "Commission settings can only be updated for pending withdrawals.",
      );
    }

    const hasCommissionFees = parsed.data.hasCommissionFees;
    const commissionPercent = hasCommissionFees
      ? toDecimal(parsed.data.commissionPercent)
      : toDecimal(0);
    const sourceType = withdrawal.investmentOrder
      ? "INVESTMENT_ORDER"
      : "SAVINGS_ACCOUNT";
    const savingsFeeAmount =
      hasCommissionFees && sourceType === "SAVINGS_ACCOUNT"
        ? toDecimal(withdrawal.amount).mul(commissionPercent).div(100)
        : null;

    await prisma.withdrawalOrder.update({
      where: {
        id: withdrawal.id,
      },
      data: {
        hasCommissionFees,
        commissionPercent,
        commissionStatus: hasCommissionFees ? "PENDING" : "VOID",
        savingsFeeAmount,
      },
    });

    revalidatePath("/account/dashboard/admin/Withdrawals");
    revalidatePath(`/account/dashboard/admin/Withdrawals/${withdrawal.id}`);
    revalidatePath("/account/dashboard/user/withdrawals");
    revalidatePath(`/account/dashboard/user/withdrawals/${withdrawal.id}`);
    revalidatePath("/account/dashboard/notifications");

    await createRealtimeNotification({
      userId: withdrawal.investorProfile.user.id,
      event: "WITHDRAWAL",
      title: "Withdrawal commission updated",
      message: buildNotificationMessage(
        hasCommissionFees,
        hasCommissionFees ? commissionPercent.toFixed(2) : null,
      ),
      link: hasCommissionFees
        ? buildWithdrawalCommissionCheckoutUrl(withdrawal.id)
        : `/account/dashboard/user/withdrawals/${withdrawal.id}`,
      key: `withdrawal-commission:${withdrawal.id}:${hasCommissionFees}:${commissionPercent.toFixed(2)}`,
      metadata: {
        withdrawalId: withdrawal.id,
        hasCommissionFees,
        commissionPercent: decimalToNumber(commissionPercent),
        savingsFeeAmount: savingsFeeAmount
          ? decimalToNumber(savingsFeeAmount)
          : null,
        currency: withdrawal.currency,
        sourceType,
        actionLabel: hasCommissionFees ? "Pay commission" : "Open linked page",
        checkoutUrl: hasCommissionFees
          ? buildWithdrawalCommissionCheckoutUrl(withdrawal.id)
          : null,
      },
    }).catch((error) => {
      console.error("Failed to notify withdrawal commission update", error);
    });

    return createSuccessFormState("Withdrawal commission updated successfully.");
  } catch (error) {
    return createErrorFormState(
      getFriendlyServerError(
        error,
        "Unable to update this withdrawal commission right now.",
      ),
    );
  }
}
