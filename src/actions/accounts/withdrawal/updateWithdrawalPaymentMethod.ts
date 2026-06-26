"use server";

import { revalidatePath } from "next/cache";

import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import {
  createErrorFormState,
  createSuccessFormState,
  createValidationErrorState,
  getSafeServerActionErrorMessage,
  type FormActionState,
} from "@/lib/forms/actionState";
import { prisma } from "@/lib/prisma";
import { asJsonObject, toJsonValue } from "@/lib/payments/paymentJson";
import { isWithdrawalTerminalStatus } from "@/lib/payments/withdrawals/withdrawalStatusWorkflow";
import {
  readWithdrawalPaymentMethodSnapshot,
  type WithdrawalPaymentMethodOverride,
} from "@/lib/withdrawals/withdrawalPaymentMethodReview";
import { updateWithdrawalPaymentMethodSchema } from "@/lib/zodValidations/update-withdrawal-payment-method";

type FieldName =
  | "withdrawalId"
  | "methodType"
  | "receiverName"
  | "receiverCountry"
  | "receiverCity"
  | "receiverPhone"
  | "transferReference"
  | "note"
  | "recipientName"
  | "deliveryCountry"
  | "deliveryCity"
  | "deliveryAddress"
  | "contactPhone"
  | "deliveryInstructions";

export type UpdateWithdrawalPaymentMethodState = FormActionState<FieldName>;

function buildOverrideSnapshot(
  data:
    | {
        methodType: "WESTERN_UNION";
        receiverName: string;
        receiverCountry: string;
        receiverCity: string;
        receiverPhone: string;
        transferReference?: string | null;
        note?: string | null;
      }
    | {
        methodType: "CASH_DELIVERY";
        recipientName: string;
        deliveryCountry: string;
        deliveryCity: string;
        deliveryAddress: string;
        contactPhone: string;
        deliveryInstructions?: string | null;
        note?: string | null;
      },
): WithdrawalPaymentMethodOverride {
  if (data.methodType === "WESTERN_UNION") {
    return {
      type: "WESTERN_UNION",
      receiverName: data.receiverName.trim(),
      receiverCountry: data.receiverCountry.trim(),
      receiverCity: data.receiverCity.trim(),
      receiverPhone: data.receiverPhone.trim(),
      transferReference: data.transferReference?.trim() || null,
      note: data.note?.trim() || null,
    };
  }

  return {
    type: "CASH_DELIVERY",
    recipientName: data.recipientName.trim(),
    deliveryCountry: data.deliveryCountry.trim(),
    deliveryCity: data.deliveryCity.trim(),
    deliveryAddress: data.deliveryAddress.trim(),
    contactPhone: data.contactPhone.trim(),
    deliveryInstructions: data.deliveryInstructions?.trim() || null,
    note: data.note?.trim() || null,
  };
}

export async function updateWithdrawalPaymentMethod(
  _previousState: UpdateWithdrawalPaymentMethodState,
  formData: FormData,
): Promise<UpdateWithdrawalPaymentMethodState> {
  const parsed = updateWithdrawalPaymentMethodSchema.safeParse({
    withdrawalId: formData.get("withdrawalId"),
    methodType: formData.get("methodType"),
    receiverName: formData.get("receiverName"),
    receiverCountry: formData.get("receiverCountry"),
    receiverCity: formData.get("receiverCity"),
    receiverPhone: formData.get("receiverPhone"),
    transferReference: formData.get("transferReference"),
    note: formData.get("note"),
    recipientName: formData.get("recipientName"),
    deliveryCountry: formData.get("deliveryCountry"),
    deliveryCity: formData.get("deliveryCity"),
    deliveryAddress: formData.get("deliveryAddress"),
    contactPhone: formData.get("contactPhone"),
    deliveryInstructions: formData.get("deliveryInstructions"),
  });

  if (!parsed.success) {
    return createValidationErrorState(
      parsed.error.flatten().fieldErrors,
      "Please review the highlighted payment details.",
    );
  }

  const user = await getCurrentSessionUser();

  if (!user?.id) {
    return createErrorFormState("Please sign in to continue.");
  }

  try {
    const withdrawal = await prisma.withdrawalOrder.findFirst({
      where: {
        id: parsed.data.withdrawalId,
        investorProfile: {
          userId: user.id,
        },
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

    if (paymentMethodSnapshot.review.status !== "UNAVAILABLE") {
      return createErrorFormState(
        "This withdrawal payment method does not require an update.",
      );
    }

    const override = buildOverrideSnapshot(parsed.data);
    const currentSnapshot = asJsonObject(withdrawal.payoutSnapshot);
    const now = new Date().toISOString();
    const updatedSnapshot = {
      ...currentSnapshot,
      paymentMethodReview: {
        status: "UPDATED",
        reason: null,
        updatedAt: now,
        updatedByUserId: user.id,
      },
      paymentMethodOverride: override,
    };

    await prisma.withdrawalOrder.update({
      where: {
        id: withdrawal.id,
      },
      data: {
        payoutSnapshot: toJsonValue(updatedSnapshot),
      },
    });

    revalidatePath("/account/dashboard/user/withdrawals");
    revalidatePath(`/account/dashboard/user/withdrawals/${withdrawal.id}`);
    revalidatePath("/account/dashboard/admin/Withdrawals");
    revalidatePath(`/account/dashboard/admin/Withdrawals/${withdrawal.id}`);

    return createSuccessFormState("Payment details updated successfully.");
  } catch (error) {
    return createErrorFormState(
      getSafeServerActionErrorMessage(
        "updateWithdrawalPaymentMethod",
        error,
        "Unable to update the payment details right now.",
      ),
    );
  }
}
