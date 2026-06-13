"use server";

import { revalidatePath } from "next/cache";

import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import {
  createErrorFormState,
  createSuccessFormState,
  createValidationErrorState,
  type FormActionState,
} from "@/lib/forms/actionState";
import { prisma } from "@/lib/prisma";
import { getWithdrawalSourceOptions } from "@/lib/service/getAvailableWithdrawalSource";
import {
  buildWithdrawalAllocationPlan,
  buildWithdrawalBalanceSnapshot,
} from "@/lib/service/withdrawalBalanceSnapshot";
import { toDecimal } from "@/lib/services/investment/decimal";
import { createWithdrawalOrderSchema } from "@/lib/zodValidations/account-operations";

export type CreateWithdrawalOrderState = FormActionState<
  "amount" | "methodId" | "sourceType" | "sourceId"
>;

export async function createWithdrawalOrder(
  _prevState: CreateWithdrawalOrderState,
  formData: FormData,
): Promise<CreateWithdrawalOrderState> {
  const parsed = createWithdrawalOrderSchema.safeParse({
    amount: formData.get("amount"),
    methodId: formData.get("methodId"),
    sourceType: formData.get("sourceType"),
    sourceId: formData.get("sourceId"),
  });

  if (!parsed.success) {
    return createValidationErrorState(
      parsed.error.flatten().fieldErrors,
      "Please review your withdrawal details.",
    );
  }

  const user = await getCurrentSessionUser();
  if (!user?.id) {
    return createErrorFormState("Please sign in to continue.");
  }

  const profile = await prisma.investorProfile.findUnique({
    where: { userId: user.id },
    include: { paymentMethods: true },
  });

  if (!profile) {
    return createErrorFormState("Profile not found.");
  }

  if (profile.kycStatus !== "VERIFIED") {
    return createErrorFormState(
      "Complete identity verification before requesting a withdrawal.",
    );
  }

  const { amount, methodId, sourceId, sourceType } = parsed.data;
  const requestedAmount = toDecimal(amount);

  const method = profile.paymentMethods.find((m) => m.id === methodId);

  if (!method) {
    return createErrorFormState("Please select a valid payment method.", {
      methodId: ["Please select a valid payment method."],
    });
  }

  const withdrawalSources = await getWithdrawalSourceOptions(profile.id);
  const withdrawalSource = withdrawalSources.find(
    (source) => source.type === sourceType && source.id === sourceId,
  );

  if (!withdrawalSource || withdrawalSource.amount <= 0) {
    return createErrorFormState(
      "There is no available balance eligible for withdrawal right now.",
      {
        sourceId: ["Select a valid withdrawal source."],
      },
    );
  }

  if (requestedAmount.greaterThan(withdrawalSource.amount)) {
    return createErrorFormState(
      "Withdrawal amount exceeds the available balance.",
      {
        amount: ["Withdrawal amount exceeds the available balance."],
      },
    );
  }

  const snapshot = await buildWithdrawalBalanceSnapshot(profile.id);
  const allocationPlan = buildWithdrawalAllocationPlan(
    snapshot,
    sourceType,
    requestedAmount,
  );

  const payoutSnapshot = {
    sourceType,
    sourceId,
    sourceLabel: withdrawalSource.label,
    type: method.type,
    bankName: method.bankName,
    accountName: method.accountName,
    accountNumber: method.accountNumber,
    network: method.network,
    address: method.address,
    requestedAmount: allocationPlan.requestedAmount.toString(),
    penaltyAmount: allocationPlan.penaltyAmount.toString(),
    netPayoutAmount: allocationPlan.netPayoutAmount.toString(),
    allocations: allocationPlan.allocations.map((allocation) => ({
      sourceType: allocation.sourceType,
      sourceId: allocation.sourceId,
      sourceLabel: allocation.sourceLabel,
      sourceGrossAmount: allocation.sourceGrossAmount.toString(),
      sourcePenaltyAmount: allocation.sourcePenaltyAmount.toString(),
      sourceNetAmount: allocation.sourceNetAmount.toString(),
      currency: allocation.currency,
    })),
  };

  await prisma.$transaction(async (tx) => {
    const withdrawalOrder = await tx.withdrawalOrder.create({
      data: {
        investorProfileId: profile.id,
        amount: allocationPlan.netPayoutAmount,
        currency: withdrawalSource.currency,
        payoutMethodId: method.id,
        payoutSnapshot,
        status: "PENDING",
        investmentAccountId: null,
        investmentOrderId: null,
      },
    });

    if (allocationPlan.allocations.length === 0) {
      throw new Error("Unable to allocate the withdrawal request.");
    }

    await tx.withdrawalOrderAllocation.createMany({
      data: allocationPlan.allocations.map((allocation) => ({
        withdrawalOrderId: withdrawalOrder.id,
        sourceType: allocation.sourceType,
        sourceId: allocation.sourceId,
        sourceLabel: allocation.sourceLabel,
        sourceGrossAmount: allocation.sourceGrossAmount,
        sourcePenaltyAmount: allocation.sourcePenaltyAmount,
        sourceNetAmount: allocation.sourceNetAmount,
        currency: allocation.currency,
        investmentOrderId: allocation.investmentOrderId,
        savingsAccountId: allocation.savingsAccountId,
      })),
    });
  });

  revalidatePath("/account/dashboard/user/withdrawals");

  return createSuccessFormState("Withdrawal request submitted.");
}
