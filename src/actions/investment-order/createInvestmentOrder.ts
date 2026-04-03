"use server";

import { redirect } from "next/navigation";

import { Prisma } from "@/generated/prisma";
import {
  InvestmentCatalogStatus,
  InvestmentOrderStatus,
} from "@/generated/prisma";
import { formatCurrency, formatEnumLabel } from "@/lib/formatters/formatters";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { prisma } from "@/lib/prisma";
import {
  createInvestmentOrderSchema,
  parseInvestmentOrderAmount,
} from "@/lib/zodValidations/investment-order";
import type {
  CreateInvestmentOrderActionState,
  OrderFieldName,
} from "./createInvestmentOrder.state";

function getFormValue(formData: FormData, key: OrderFieldName) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function getFieldErrors(error: Parameters<typeof createErrorState>[1]) {
  return error;
}

function createErrorState(
  message: string,
  fieldErrors?: Partial<Record<OrderFieldName, string>>,
): CreateInvestmentOrderActionState {
  return {
    status: "error",
    message,
    fieldErrors,
  };
}

function toNumber(value: { toNumber(): number } | number) {
  if (typeof value === "number") return value;
  return value.toNumber();
}

export async function createInvestmentOrder(
  _previousState: CreateInvestmentOrderActionState,
  formData: FormData,
): Promise<CreateInvestmentOrderActionState> {
  const user = await getCurrentSessionUser();

  if (!user?.id) {
    return createErrorState("Please sign in to continue.");
  }

  const investorProfile = await prisma.investorProfile.findUnique({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
    },
  });

  if (!investorProfile?.id) {
    return createErrorState(
      "Complete your investment profile before creating an investment order.",
    );
  }

  const rawValues = {
    investmentType: getFormValue(formData, "investmentType"),
    planCategory: getFormValue(formData, "planCategory"),
    investmentPlanId: getFormValue(formData, "investmentPlanId"),
    amount: getFormValue(formData, "amount"),
  };

  const parsedValues = createInvestmentOrderSchema.safeParse(rawValues);

  if (!parsedValues.success) {
    const flattened = parsedValues.error.flatten().fieldErrors;

    return createErrorState(
      "Please review the highlighted fields before continuing.",
      getFieldErrors({
        investmentType: flattened.investmentType?.[0],
        planCategory: flattened.planCategory?.[0],
        investmentPlanId: flattened.investmentPlanId?.[0],
        amount: flattened.amount?.[0],
      }),
    );
  }

  const amount = parseInvestmentOrderAmount(parsedValues.data.amount);

  if (amount === null) {
    return createErrorState("Enter a valid investment amount.", {
      amount: "Enter a valid investment amount.",
    });
  }

  const selectedPlan = await prisma.investmentPlan.findUnique({
    where: {
      id: parsedValues.data.investmentPlanId,
    },
    select: {
      id: true,
      category: true,
      minAmount: true,
      maxAmount: true,
      currency: true,
      isActive: true,
      investment: {
        select: {
          id: true,
          name: true,
          type: true,
          isActive: true,
          status: true,
        },
      },
    },
  });

  if (!selectedPlan?.isActive) {
    return createErrorState(
      "The selected investment plan is no longer available. Choose another plan to continue.",
      {
        investmentPlanId: "The selected plan is no longer available.",
      },
    );
  }

  if (
    !selectedPlan.investment.isActive ||
    selectedPlan.investment.status !== InvestmentCatalogStatus.ACTIVE
  ) {
    return createErrorState(
      "The selected investment product is currently unavailable. Choose another option to continue.",
      {
        investmentPlanId:
          "The selected investment product is currently unavailable.",
      },
    );
  }

  if (parsedValues.data.investmentType !== selectedPlan.investment.type) {
    return createErrorState(
      "Select a plan that matches your chosen investment type.",
      {
        investmentType: `Choose a ${formatEnumLabel(
          selectedPlan.investment.type,
        )} plan to continue.`,
      },
    );
  }

  if (parsedValues.data.planCategory !== selectedPlan.category) {
    return createErrorState(
      "Select a plan that matches your chosen category.",
      {
        planCategory: `Choose a ${formatEnumLabel(
          selectedPlan.category,
        )} plan category to continue.`,
      },
    );
  }

  const minAmount = toNumber(selectedPlan.minAmount);
  const maxAmount = toNumber(selectedPlan.maxAmount);

  if (amount < minAmount || amount > maxAmount) {
    return createErrorState(
      `Enter an amount between ${formatCurrency(
        minAmount,
        selectedPlan.currency,
      )} and ${formatCurrency(maxAmount, selectedPlan.currency)}.`,
      {
        amount: `Allowed range: ${formatCurrency(
          minAmount,
          selectedPlan.currency,
        )} to ${formatCurrency(maxAmount, selectedPlan.currency)}.`,
      },
    );
  }

  const order = await prisma.investmentOrder.create({
    data: {
      investorProfileId: investorProfile.id,
      investmentPlanId: selectedPlan.id,
      amount: new Prisma.Decimal(amount.toFixed(2)),
      currency: selectedPlan.currency,
      status: InvestmentOrderStatus.PENDING_PAYMENT,
    },
    select: {
      id: true,
    },
  });

  redirect(`/account/dashboard/user/investments?created=${order.id}`);
}
