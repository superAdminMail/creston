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
  getWithdrawalCommissionFieldConfig,
  getWithdrawalCommissionSourceType,
  normalizeWithdrawalCommissionInput,
  readWithdrawalSnapshotString,
} from "@/lib/payments/withdrawals/withdrawalCommissionSettings";
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

export async function updateWithdrawalCommission(
  _previousState: UpdateWithdrawalCommissionState,
  formData: FormData,
): Promise<UpdateWithdrawalCommissionState> {
  await requireDashboardRoleAccess(["ADMIN", "SUPER_ADMIN"]);

  const parsed = updateWithdrawalCommissionSchema.safeParse({
    withdrawalId: formData.get("withdrawalId"),
    hasCommissionFees: formData.get("hasCommissionFees"),
    commissionPercent: normalizeWithdrawalCommissionInput(
      formData.get("commissionPercent"),
    ),
    feeAmount: normalizeWithdrawalCommissionInput(formData.get("feeAmount")),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as Partial<
      Record<FieldName, string[]>
    >;
    const firstFieldError = Object.values(fieldErrors)
      .flat()
      .find((value): value is string => typeof value === "string" && value.length > 0);

    return createValidationErrorState(
      fieldErrors,
      firstFieldError ?? "Please review the commission settings.",
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
        investmentOrderId: true,
        payoutSnapshot: true,
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
    const sourceType = getWithdrawalCommissionSourceType({
      investmentOrderId: withdrawal.investmentOrderId,
      sourceType: readWithdrawalSnapshotString(
        withdrawal.payoutSnapshot,
        "sourceType",
      ),
    });
    const commissionField = getWithdrawalCommissionFieldConfig(sourceType);
    const commissionInput =
      sourceType === "INVESTMENT_ORDER"
        ? parsed.data.commissionPercent
        : parsed.data.feeAmount;

    if (hasCommissionFees) {
      if (!commissionInput) {
        return createValidationErrorState(
          {
            [commissionField.fieldName]: [commissionField.emptyMessage],
          } satisfies Partial<Record<FieldName, string[]>>,
          commissionField.emptyMessage,
        );
      }

      const commissionNumber = Number(commissionInput);

      if (!Number.isFinite(commissionNumber) || commissionNumber <= 0) {
        return createValidationErrorState(
          {
            [commissionField.fieldName]: [commissionField.positiveMessage],
          } satisfies Partial<Record<FieldName, string[]>>,
          commissionField.positiveMessage,
        );
      }

      if (
        sourceType === "INVESTMENT_ORDER" &&
        commissionNumber > 100
      ) {
        return createValidationErrorState(
          {
            [commissionField.fieldName]: [
              commissionField.maxMessage ?? "Invalid commission value.",
            ],
          } satisfies Partial<Record<FieldName, string[]>>,
          commissionField.maxMessage ?? "Invalid commission value.",
        );
      }

      if (
        sourceType === "SAVINGS_ACCOUNT" &&
        commissionNumber > decimalToNumber(withdrawal.amount)
      ) {
        return createValidationErrorState(
          {
            [commissionField.fieldName]: [
              commissionField.maxMessage ?? "Invalid fee amount.",
            ],
          } satisfies Partial<Record<FieldName, string[]>>,
          commissionField.maxMessage ?? "Invalid fee amount.",
        );
      }
    }

    const commissionPercent =
      hasCommissionFees && sourceType === "INVESTMENT_ORDER"
        ? toDecimal(commissionInput ?? "0")
        : toDecimal(0);
    const savingsFeeAmount =
      hasCommissionFees && sourceType === "SAVINGS_ACCOUNT"
        ? toDecimal(commissionInput ?? "0")
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
