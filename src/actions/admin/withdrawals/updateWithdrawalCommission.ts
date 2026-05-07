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
import { formatCurrency } from "@/lib/formatters/formatters";

type FieldName =
  | "withdrawalId"
  | "hasCommissionFees"
  | "commissionPercent"
  | "feeAmount";

export type UpdateWithdrawalCommissionState = FormActionState<FieldName>;

function buildNotificationMessage(
  sourceType: "INVESTMENT_ORDER" | "SAVINGS_ACCOUNT",
  hasCommissionFees: boolean,
  commissionPercent: string | null,
  feeAmount: string | null,
  currency: string,
) {
  if (!hasCommissionFees) {
    return sourceType === "SAVINGS_ACCOUNT"
      ? "Withdrawal fee has been removed from your withdrawal order."
      : "Withdrawal commission has been removed from your withdrawal order.";
  }

  if (sourceType === "SAVINGS_ACCOUNT") {
    return `Withdrawal fee has been updated to ${feeAmount ?? formatCurrency(0, currency)}.`;
  }

  return `Withdrawal commission has been updated to ${commissionPercent ?? "0"}%.`;
}

function normalizeDecimalInput(
  value: string | null | undefined,
) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
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
    feeAmount: formData.get("feeAmount"),
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
    const sourceType = withdrawal.investmentOrder
      ? "INVESTMENT_ORDER"
      : "SAVINGS_ACCOUNT";
    const commissionPercentInput = normalizeDecimalInput(
      parsed.data.commissionPercent,
    );
    const feeAmountInput = normalizeDecimalInput(parsed.data.feeAmount);

    if (hasCommissionFees && sourceType === "INVESTMENT_ORDER") {
      if (!commissionPercentInput) {
        return createValidationErrorState(
          {
            commissionPercent: ["Enter a commission percent."],
          } satisfies Partial<Record<FieldName, string[]>>,
          "Please review the commission settings.",
        );
      }

      const commissionPercentNumber = Number(commissionPercentInput);

      if (
        !Number.isFinite(commissionPercentNumber) ||
        commissionPercentNumber <= 0 ||
        commissionPercentNumber > 100
      ) {
        return createValidationErrorState(
          {
            commissionPercent: [
              commissionPercentNumber <= 0
                ? "Commission percent must be greater than zero."
                : "Commission percent cannot exceed 100.",
            ],
          } satisfies Partial<Record<FieldName, string[]>>,
          "Please review the commission settings.",
        );
      }
    }

    if (hasCommissionFees && sourceType === "SAVINGS_ACCOUNT") {
      if (!feeAmountInput) {
        return createValidationErrorState(
          {
            feeAmount: ["Enter a fee amount."],
          } satisfies Partial<Record<FieldName, string[]>>,
          "Please review the commission settings.",
        );
      }

      const feeAmountNumber = Number(feeAmountInput);

      if (!Number.isFinite(feeAmountNumber) || feeAmountNumber <= 0) {
        return createValidationErrorState(
          {
            feeAmount: ["Fee amount must be greater than zero."],
          } satisfies Partial<Record<FieldName, string[]>>,
          "Please review the commission settings.",
        );
      }

      if (feeAmountNumber > decimalToNumber(withdrawal.amount)) {
        return createValidationErrorState(
          {
            feeAmount: [
              "Fee amount cannot exceed the withdrawal amount.",
            ],
          } satisfies Partial<Record<FieldName, string[]>>,
          "Please review the commission settings.",
        );
      }
    }

    const commissionPercent =
      hasCommissionFees && sourceType === "INVESTMENT_ORDER"
        ? toDecimal(commissionPercentInput ?? "0")
        : toDecimal(0);
    const savingsFeeAmount =
      hasCommissionFees && sourceType === "SAVINGS_ACCOUNT"
        ? toDecimal(feeAmountInput ?? "0")
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
        sourceType,
        hasCommissionFees,
        hasCommissionFees ? commissionPercent.toFixed(2) : null,
        hasCommissionFees && sourceType === "SAVINGS_ACCOUNT"
          ? formatCurrency(
              decimalToNumber(savingsFeeAmount ?? toDecimal(0)),
              withdrawal.currency,
            )
          : null,
        withdrawal.currency,
      ),
      link: hasCommissionFees
        ? buildWithdrawalCommissionCheckoutUrl(withdrawal.id)
        : `/account/dashboard/user/withdrawals/${withdrawal.id}`,
      key: `withdrawal-commission:${withdrawal.id}:${hasCommissionFees}:${sourceType === "SAVINGS_ACCOUNT" ? decimalToNumber(savingsFeeAmount ?? toDecimal(0)).toFixed(2) : commissionPercent.toFixed(2)}`,
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
