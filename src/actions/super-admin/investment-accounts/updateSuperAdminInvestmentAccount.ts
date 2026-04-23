"use server";

import {
  createErrorFormState,
  createSuccessFormState,
  createValidationErrorState,
  type FormActionState,
} from "@/lib/forms/actionState";
import { prisma } from "@/lib/prisma";
import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";
import { updateInvestmentAccountSchema } from "@/lib/zodValidations/investment-account";

export type UpdateSuperAdminInvestmentAccountState = FormActionState<"status">;

export async function updateSuperAdminInvestmentAccount(
  _prevState: UpdateSuperAdminInvestmentAccountState,
  formData: FormData,
): Promise<UpdateSuperAdminInvestmentAccountState> {
  await requireSuperAdminAccess();

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

  const account = await prisma.investmentAccount.findUnique({
    where: { id: accountId },
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
