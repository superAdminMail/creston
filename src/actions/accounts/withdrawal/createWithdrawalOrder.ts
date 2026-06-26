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
import { getWithdrawalSourceOptions } from "@/lib/service/getAvailableWithdrawalSource";
import {
  buildWithdrawalAllocationPlan,
  buildWithdrawalBalanceSnapshot,
} from "@/lib/service/withdrawalBalanceSnapshot";
import { pauseInvestmentOrdersForWithdrawal } from "@/lib/payments/withdrawals/withdrawalInvestmentOrderHolds";
import { decimalToNumber, toDecimal } from "@/lib/services/investment/decimal";
import { formatCurrency } from "@/lib/formatters/formatters";
import {
  createWithdrawalOrderSchema,
  MIN_WITHDRAWAL_AMOUNT,
} from "@/lib/zodValidations/account-operations";

export type CreateWithdrawalOrderState = FormActionState<
  "amount" | "methodId" | "allocationMode" | "sourceType" | "sourceId"
>;

function buildAutoAllocationLabel(
  allocations: Array<{ sourceType: "INVESTMENT_ORDER" | "SAVINGS_ACCOUNT" }>,
) {
  const hasSavings = allocations.some(
    (allocation) => allocation.sourceType === "SAVINGS_ACCOUNT",
  );
  const hasInvestment = allocations.some(
    (allocation) => allocation.sourceType === "INVESTMENT_ORDER",
  );

  if (hasSavings && hasInvestment) {
    return "Auto allocation across savings and investment balances";
  }

  if (hasSavings) {
    return "Auto allocation from savings balance";
  }

  if (hasInvestment) {
    return "Auto allocation from investment balance";
  }

  return "Auto allocation";
}

export async function createWithdrawalOrder(
  _prevState: CreateWithdrawalOrderState,
  formData: FormData,
): Promise<CreateWithdrawalOrderState> {
  const parsed = createWithdrawalOrderSchema.safeParse({
    amount: formData.get("amount"),
    methodId: formData.get("methodId"),
    allocationMode: formData.get("allocationMode"),
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

  const { amount, methodId, sourceId, sourceType, allocationMode } = parsed.data;
  const requestedAmount = toDecimal(amount);

  const method = profile.paymentMethods.find((m) => m.id === methodId);

  if (!method) {
    return createErrorFormState("Please select a valid payment method.", {
      methodId: ["Please select a valid payment method."],
    });
  }

  const snapshot = await buildWithdrawalBalanceSnapshot(profile.id);
  const withdrawalSources = await getWithdrawalSourceOptions(profile.id);
  const spansSavingsAndInvestment =
    snapshot.savingsBalance.greaterThan(0) &&
    snapshot.accountBalance.greaterThan(0) &&
    requestedAmount.greaterThan(snapshot.savingsBalance) &&
    !requestedAmount.greaterThan(snapshot.totalBalance);
  const effectiveAllocationMode = spansSavingsAndInvestment
    ? "AUTO"
    : allocationMode;
  const isSingleSelection = effectiveAllocationMode === "SINGLE";
  const withdrawalSource = isSingleSelection
    ? withdrawalSources.find(
        (source) => source.type === sourceType && source.id === sourceId,
      )
    : null;

  if (requestedAmount.lessThan(MIN_WITHDRAWAL_AMOUNT)) {
    const minimumMessage = `Amount must be at least ${formatCurrency(
      MIN_WITHDRAWAL_AMOUNT,
      snapshot.currency,
    )}.`;

    return createErrorFormState(minimumMessage, {
      amount: [minimumMessage],
    });
  }

  if (isSingleSelection) {
    if (!withdrawalSource || withdrawalSource.amount <= 0) {
      return createErrorFormState(
        "There is no available balance eligible for withdrawal right now.",
        {
          sourceId: ["Select a valid withdrawal source."],
        },
      );
    }

    if (requestedAmount.greaterThan(withdrawalSource.amount)) {
      const maximumMessage = `Maximum withdrawal amount is ${formatCurrency(
        withdrawalSource.amount,
        snapshot.currency,
      )}.`;

      return createErrorFormState(maximumMessage, {
        amount: [maximumMessage],
      });
    }
  } else if (requestedAmount.greaterThan(snapshot.totalBalance)) {
    const maximumMessage = `Maximum withdrawal amount is ${formatCurrency(
      decimalToNumber(snapshot.totalBalance),
      snapshot.currency,
    )}.`;

    return createErrorFormState(maximumMessage, {
      amount: [maximumMessage],
    });
  }

  let allocationPlan;

  try {
    allocationPlan = buildWithdrawalAllocationPlan(
      snapshot,
      {
        allocationMode: effectiveAllocationMode,
        sourceType: isSingleSelection ? sourceType : null,
        sourceId: isSingleSelection ? sourceId : null,
      },
      requestedAmount,
    );
  } catch (error) {
    return createErrorFormState(
      getSafeServerActionErrorMessage(
        "createWithdrawalOrder",
        error,
        "Unable to allocate the withdrawal request.",
      ),
      {
        amount: [
          "Unable to allocate the withdrawal request with the available balance.",
        ],
      },
    );
  }

  if (allocationPlan.netPayoutAmount.lessThanOrEqualTo(0)) {
    return createErrorFormState(
      "Withdrawal amount must exceed the early withdrawal fee.",
      {
        amount: ["Withdrawal amount must exceed the early withdrawal fee."],
      },
    );
  }

  const sourceLabel = isSingleSelection
    ? withdrawalSource?.label ?? "Withdrawal source"
    : buildAutoAllocationLabel(allocationPlan.allocations);

  const affectedInvestmentOrderIds = [
    ...new Set(
      allocationPlan.allocations
        .map((allocation) => allocation.investmentOrderId)
        .filter((investmentOrderId): investmentOrderId is string =>
          Boolean(investmentOrderId),
        ),
    ),
  ];
  const hasEarlyWithdrawalPenalty = allocationPlan.penaltyAmount.greaterThan(0);

  const payoutSnapshot = {
    allocationMode: effectiveAllocationMode,
    sourceType: isSingleSelection ? sourceType : null,
    sourceId: isSingleSelection ? sourceId : null,
    sourceLabel,
    type: method.type,
    bankName: method.bankName,
    accountName: method.accountName,
    accountNumber: method.accountNumber,
    network: method.network,
    address: method.address,
    requestedAmount: allocationPlan.requestedAmount.toString(),
    penaltyAmount: allocationPlan.penaltyAmount.toString(),
    withdrawalMode: hasEarlyWithdrawalPenalty ? "EARLY_WITHDRAWAL" : null,
    earlyWithdrawalPenalty: hasEarlyWithdrawalPenalty
      ? allocationPlan.penaltyAmount.toString()
      : null,
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

  if (allocationPlan.allocations.length === 0) {
    return createErrorFormState(
      "Unable to allocate the withdrawal request.",
    );
  }

  await prisma.$transaction(async (tx) => {
    const withdrawalOrder = await tx.withdrawalOrder.create({
      data: {
        investorProfileId: profile.id,
        amount: allocationPlan.netPayoutAmount,
        currency: snapshot.currency,
        payoutMethodId: method.id,
        payoutSnapshot,
        status: "PENDING",
        investmentAccountId: null,
        investmentOrderId: null,
      },
    });

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

    await pauseInvestmentOrdersForWithdrawal(tx, {
      withdrawalId: withdrawalOrder.id,
      orderIds: affectedInvestmentOrderIds,
    });
  });

  revalidatePath("/account/dashboard/user/withdrawals");
  revalidatePath("/account/dashboard/user");
  revalidatePath("/account/dashboard/user/investment-orders");

  for (const orderId of affectedInvestmentOrderIds) {
    revalidatePath(`/account/dashboard/user/investment-orders/${orderId}`);
    revalidatePath(
      `/account/dashboard/user/investment-orders/${orderId}/payment`,
    );
    revalidatePath(
      `/account/dashboard/user/investment-orders/${orderId}/upgrade`,
    );
  }

  return createSuccessFormState("Withdrawal request submitted.");
}
