"use server";

import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import {
  createErrorFormState,
  createInitialFormState,
  createSuccessFormState,
  createValidationErrorState,
  type FormActionState,
} from "@/lib/forms/actionState";
import { prisma } from "@/lib/prisma";
import { updateInvestmentAccountSchema } from "@/lib/zodValidations/investment-account";

export type UpdateInvestmentAccountState = FormActionState<"status">;

export const initialInvestmentAccountFormState: UpdateInvestmentAccountState =
  createInitialFormState();

export async function updateInvestmentAccount(
  _prevState: UpdateInvestmentAccountState,
  formData: FormData,
): Promise<UpdateInvestmentAccountState> {
  const user = await getCurrentSessionUser();

  if (!user?.id) {
    return createErrorFormState("Unauthorized");
  }

  const accountId = formData.get("accountId");
  const parsed = updateInvestmentAccountSchema.safeParse({
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return createValidationErrorState(
      parsed.error.flatten().fieldErrors,
      "Please choose a valid account status.",
    );
  }

  if (!accountId || typeof accountId !== "string") {
    return createErrorFormState("Invalid request");
  }

  const account = await prisma.investmentAccount.findFirst({
    where: {
      id: accountId,
      investorProfile: {
        userId: user.id,
      },
    },
    select: {
      id: true,
      openedAt: true,
    },
  });

  if (!account) {
    return createErrorFormState("Account not found");
  }

  const { status } = parsed.data;

  await prisma.investmentAccount.update({
    where: { id: accountId },
    data: {
      status,
      openedAt:
        status === "ACTIVE" ? account.openedAt ?? new Date() : account.openedAt,
      closedAt: status === "CLOSED" ? new Date() : null,
    },
  });

  return createSuccessFormState("Account updated.");
}
