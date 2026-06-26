"use server";

import { revalidatePath } from "next/cache";

import { createRealtimeNotification } from "@/lib/notifications/createNotification";
import {
  createErrorFormState,
  createSuccessFormState,
  createValidationErrorState,
  getSafeServerActionErrorMessage,
  type FormActionState,
} from "@/lib/forms/actionState";
import { prisma } from "@/lib/prisma";
import { asJsonObject, toJsonValue } from "@/lib/payments/paymentJson";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import { isWithdrawalTerminalStatus } from "@/lib/payments/withdrawals/withdrawalStatusWorkflow";
import {
  readWithdrawalPaymentMethodSnapshot,
  type WithdrawalPaymentMethodReviewStatus,
} from "@/lib/withdrawals/withdrawalPaymentMethodReview";

type FieldName = "withdrawalId" | "isAvailable" | "reason";

export type UpdateWithdrawalPaymentMethodAvailabilityState =
  FormActionState<FieldName>;

function readBoolean(value: FormDataEntryValue | null) {
  return value === "true";
}

export async function updateWithdrawalPaymentMethodAvailability(
  _previousState: UpdateWithdrawalPaymentMethodAvailabilityState,
  formData: FormData,
): Promise<UpdateWithdrawalPaymentMethodAvailabilityState> {
  const parsedWithdrawalId = formData.get("withdrawalId");
  const parsedIsAvailable = formData.get("isAvailable");
  const parsedReason = formData.get("reason");

  if (typeof parsedWithdrawalId !== "string" || !parsedWithdrawalId.trim()) {
    return createValidationErrorState(
      {
        withdrawalId: ["Withdrawal order is required."],
      },
      "Withdrawal order is required.",
    );
  }

  if (parsedIsAvailable !== "true" && parsedIsAvailable !== "false") {
    return createValidationErrorState(
      {
        isAvailable: ["Select a valid payment method availability state."],
      },
      "Select a valid payment method availability state.",
    );
  }

  const { userId } = await requireDashboardRoleAccess(["SUPER_ADMIN"]);

  try {
    const withdrawal = await prisma.withdrawalOrder.findUnique({
      where: {
        id: parsedWithdrawalId,
      },
      select: {
        id: true,
        status: true,
        payoutSnapshot: true,
        investorProfile: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!withdrawal) {
      return createErrorFormState("Withdrawal order not found.");
    }

    if (isWithdrawalTerminalStatus(withdrawal.status)) {
      return createErrorFormState(
        "This withdrawal is no longer active and cannot be updated.",
      );
    }

    const paymentMethodSnapshot = readWithdrawalPaymentMethodSnapshot(
      withdrawal.payoutSnapshot,
    );
    const nextReviewStatus: WithdrawalPaymentMethodReviewStatus = readBoolean(
      parsedIsAvailable,
    )
      ? "AVAILABLE"
      : "UNAVAILABLE";
    const reason =
      typeof parsedReason === "string" && parsedReason.trim().length > 0
        ? parsedReason.trim()
        : null;

    if (paymentMethodSnapshot.review.status === nextReviewStatus) {
      return createSuccessFormState(
        nextReviewStatus === "AVAILABLE"
          ? "Payment method is already available."
          : "Payment method is already unavailable.",
      );
    }

    if (nextReviewStatus === "UNAVAILABLE" && !reason) {
      return createValidationErrorState(
        {
          reason: ["Enter a reason for marking this payment method unavailable."],
        },
        "Enter a reason for marking this payment method unavailable.",
      );
    }

    const currentSnapshot = asJsonObject(withdrawal.payoutSnapshot);
    const now = new Date().toISOString();
    const updatedSnapshot = {
      ...currentSnapshot,
      paymentMethodReview: {
        status: nextReviewStatus,
        reason: nextReviewStatus === "UNAVAILABLE" ? reason : null,
        updatedAt: now,
        updatedByUserId: userId,
      },
      paymentMethodOverride: null,
    };

    await prisma.withdrawalOrder.update({
      where: {
        id: withdrawal.id,
      },
      data: {
        payoutSnapshot: toJsonValue(updatedSnapshot),
      },
    });

    revalidatePath("/account/dashboard/admin/Withdrawals");
    revalidatePath(`/account/dashboard/admin/Withdrawals/${withdrawal.id}`);
    revalidatePath("/account/dashboard/user/withdrawals");
    revalidatePath(`/account/dashboard/user/withdrawals/${withdrawal.id}`);

    if (nextReviewStatus === "UNAVAILABLE") {
      await createRealtimeNotification({
        userId: withdrawal.investorProfile.userId,
        event: "WITHDRAWAL",
        title: "Withdrawal payment method needs an update",
        message: reason
          ? `Your withdrawal payment method is unavailable for processing. Reason: ${reason}`
          : "Your withdrawal payment method is unavailable for processing. Please update the payout details to continue.",
        link: `/account/dashboard/user/withdrawals/${withdrawal.id}`,
        key: `withdrawal-payment-method-unavailable:${withdrawal.id}:${now}`,
        metadata: {
          withdrawalId: withdrawal.id,
          status: nextReviewStatus,
          reason,
        },
      }).catch((error) => {
        console.error("Failed to notify withdrawal payment method availability", error);
      });
    }

    return createSuccessFormState(
      nextReviewStatus === "AVAILABLE"
        ? "Payment method marked as available."
        : "Payment method marked as unavailable.",
    );
  } catch (error) {
    return createErrorFormState(
      getSafeServerActionErrorMessage(
        "updateWithdrawalPaymentMethodAvailability",
        error,
        "Unable to update payment method availability right now.",
      ),
    );
  }
}
