"use server";

import { InvestmentCatalogStatus } from "@/generated/prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import {
  createErrorFormState,
  createValidationErrorState,
  type FormActionState,
} from "@/lib/forms/actionState";
import { prisma } from "@/lib/prisma";
import { createInvestmentAccountSchema } from "@/lib/zodValidations/investment-account";

type CreateInvestmentAccountState = FormActionState<"investmentPlanId"> & {
  accountId?: string;
};

function createErrorState(message: string): CreateInvestmentAccountState {
  return createErrorFormState(message);
}

export async function createInvestmentAccount(
  _prevState: CreateInvestmentAccountState,
  formData: FormData,
): Promise<CreateInvestmentAccountState> {
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

  if (!investorProfile) {
    return createErrorState(
      "Complete your investment profile before creating an account.",
    );
  }

  const parsed = createInvestmentAccountSchema.safeParse({
    investmentPlanId: formData.get("investmentPlanId"),
  });

  if (!parsed.success) {
    return createValidationErrorState(
      parsed.error.flatten().fieldErrors,
      "Please select a valid investment plan.",
    );
  }

  const { investmentPlanId } = parsed.data;

  const selectedPlan = await prisma.investmentPlan.findUnique({
    where: {
      id: investmentPlanId,
    },
    select: {
      id: true,
      currency: true,
      isActive: true,
      investment: {
        select: {
          isActive: true,
          status: true,
        },
      },
    },
  });

  if (!selectedPlan?.isActive) {
    return createErrorState(
      "The selected investment plan is no longer available.",
    );
  }

  if (
    !selectedPlan.investment.isActive ||
    selectedPlan.investment.status !== InvestmentCatalogStatus.ACTIVE
  ) {
    return createErrorState("This investment product is currently unavailable.");
  }

  const existingAccount = await prisma.investmentAccount.findFirst({
    where: {
      investorProfileId: investorProfile.id,
      investmentPlanId: selectedPlan.id,
    },
    select: {
      id: true,
    },
  });

  if (existingAccount) {
    return createErrorState(
      "You already have an account for this investment plan.",
    );
  }

  const account = await prisma.investmentAccount.create({
    data: {
      investorProfileId: investorProfile.id,
      investmentPlanId: selectedPlan.id,
      balance: 0,
      currency: selectedPlan.currency,
    },
    select: {
      id: true,
    },
  });

  return {
    status: "success",
    message: "Account created",
    accountId: account.id,
  };
}
