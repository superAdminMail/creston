"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import {
  createErrorFormState,
  createSuccessFormState,
  createValidationErrorState,
  type FormActionState,
} from "@/lib/forms/actionState";
import { prisma } from "@/lib/prisma";
import { getWithdrawalSourceOptions } from "@/lib/service/getAvailableWithdrawalSource";
import { toDecimal } from "@/lib/services/investment/decimal";
import { createWithdrawalOrderSchema } from "@/lib/zodValidations/account-operations";
import { InvestmentOrderStatus } from "@/generated/prisma";

export type CreateWithdrawalOrderState = FormActionState<
  "amount" | "methodId" | "sourceType" | "sourceId"
>;

function calculateEarlyWithdrawalPenalty(order: {
  amount: Prisma.Decimal;
  accruedProfit: Prisma.Decimal;
  currentValue: Prisma.Decimal | null;
  isMatured: boolean;
  maturityDate: Date | null;
  investmentPlan: {
    penaltyType: "FIXED" | "PERCENT" | null;
    earlyWithdrawalPenaltyValue: Prisma.Decimal | null;
    maxPenaltyAmount: Prisma.Decimal | null;
  };
}) {
  if (order.isMatured) {
    return new Prisma.Decimal(0);
  }

  const penaltyType = order.investmentPlan.penaltyType;
  const penaltyValue = order.investmentPlan.earlyWithdrawalPenaltyValue;

  if (!penaltyType || !penaltyValue || penaltyValue.lessThanOrEqualTo(0)) {
    return new Prisma.Decimal(0);
  }

  const grossAmount = toDecimal(order.currentValue).greaterThan(0)
    ? toDecimal(order.currentValue)
    : toDecimal(order.amount).add(toDecimal(order.accruedProfit));

  let penalty = penaltyType === "PERCENT"
    ? grossAmount.mul(toDecimal(penaltyValue)).div(100)
    : toDecimal(penaltyValue);

  if (order.investmentPlan.maxPenaltyAmount && penalty.greaterThan(order.investmentPlan.maxPenaltyAmount)) {
    penalty = toDecimal(order.investmentPlan.maxPenaltyAmount);
  }

  if (penalty.greaterThan(grossAmount)) {
    return grossAmount;
  }

  return penalty;
}

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

  const investmentOrder =
    withdrawalSource.type === "INVESTMENT_ORDER"
      ? await prisma.investmentOrder.findFirst({
          where: {
            id: withdrawalSource.id,
            investorProfileId: profile.id,
            status: {
              in: [
                InvestmentOrderStatus.PAID,
                InvestmentOrderStatus.CONFIRMED,
              ],
            },
            isWithdrawn: false,
          },
          select: {
            id: true,
            amount: true,
            accruedProfit: true,
            currentValue: true,
            currency: true,
            isMatured: true,
            maturityDate: true,
            investmentPlan: {
              select: {
                penaltyType: true,
                earlyWithdrawalPenaltyValue: true,
                maxPenaltyAmount: true,
              },
            },
          },
        })
      : null;

  const earlyWithdrawalPenalty =
    investmentOrder && !investmentOrder.isMatured
      ? calculateEarlyWithdrawalPenalty(investmentOrder)
      : new Prisma.Decimal(0);

  const netPayoutAmount = requestedAmount.sub(earlyWithdrawalPenalty);

  if (netPayoutAmount.lessThanOrEqualTo(0)) {
    return createErrorFormState(
      "The selected withdrawal amount is fully consumed by the early withdrawal penalty.",
      {
        amount: ["Increase the withdrawal amount or wait until maturity."],
      },
    );
  }

  const payoutSnapshot = {
    sourceType,
    sourceId,
    type: method.type,
    bankName: method.bankName,
    accountName: method.accountName,
    accountNumber: method.accountNumber,
    network: method.network,
    address: method.address,
    withdrawalMode:
      investmentOrder && !investmentOrder.isMatured ? "EARLY_WITHDRAWAL" : "NORMAL",
    requestedAmount: requestedAmount.toString(),
    earlyWithdrawalPenalty: earlyWithdrawalPenalty.toString(),
    netPayoutAmount: netPayoutAmount.toString(),
  };

  await prisma.withdrawalOrder.create({
    data: {
      investorProfileId: profile.id,
      amount: netPayoutAmount,
      currency: withdrawalSource.currency,
      payoutMethodId: method.id,
      payoutSnapshot,
      status: "PENDING",
      investmentAccountId: withdrawalSource.investmentAccountId,
      investmentOrderId:
        withdrawalSource.type === "INVESTMENT_ORDER"
          ? withdrawalSource.id
          : null,
    },
  });

  revalidatePath("/account/dashboard/user/withdrawals");

  return createSuccessFormState("Withdrawal request submitted.");
}
