"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  createErrorFormState,
  createValidationErrorState,
  getFriendlyServerError,
  type FormActionState,
} from "@/lib/forms/actionState";
import { logAuditEvent } from "@/lib/audit/logAuditEvent";
import { prisma } from "@/lib/prisma";
import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";

const updateSavingsAccountSchema = z.object({
  name: z.string().trim().min(1, "Account name is required."),
  description: z.string().trim().optional(),
  targetAmount: z.string().trim().optional(),
  status: z.enum(["ACTIVE", "PAUSED", "CLOSED"]),
  isLocked: z.boolean(),
  lockedUntil: z.string().trim().optional(),
});

export type UpdateSuperAdminSavingsAccountFieldName =
  | "name"
  | "description"
  | "targetAmount"
  | "status"
  | "isLocked"
  | "lockedUntil";

export type UpdateSuperAdminSavingsAccountState =
  FormActionState<UpdateSuperAdminSavingsAccountFieldName> & {
    redirectHref?: string;
  };

function parseDecimal(value: string | null | undefined) {
  const normalized = (value ?? "").trim();
  if (!normalized) return null;
  const number = Number(normalized);
  if (!Number.isFinite(number)) return null;
  return number;
}

export async function updateSuperAdminSavingsAccount(
  savingsAccountId: string,
  _prevState: UpdateSuperAdminSavingsAccountState,
  formData: FormData,
): Promise<UpdateSuperAdminSavingsAccountState> {
  try {
    const { userId } = await requireSuperAdminAccess();

    const parsed = updateSavingsAccountSchema.safeParse({
      name: formData.get("name"),
      description: formData.get("description")
        ? String(formData.get("description"))
        : "",
      targetAmount: formData.get("targetAmount")
        ? String(formData.get("targetAmount"))
        : "",
      status: formData.get("status"),
      isLocked: formData.get("isLocked") === "true",
      lockedUntil: formData.get("lockedUntil")
        ? String(formData.get("lockedUntil"))
        : "",
    });

    if (!parsed.success) {
      return createValidationErrorState(
        parsed.error.flatten().fieldErrors,
        "Please review the highlighted savings account fields.",
      ) as UpdateSuperAdminSavingsAccountState;
    }

    const account = await prisma.savingsAccount.findUnique({
      where: { id: savingsAccountId },
      select: {
        id: true,
        name: true,
        description: true,
        targetAmount: true,
        status: true,
        isLocked: true,
        lockedUntil: true,
        currency: true,
      },
    });

    if (!account) {
      return createErrorFormState("Savings account not found.") as UpdateSuperAdminSavingsAccountState;
    }

    const targetAmount = parseDecimal(parsed.data.targetAmount);
    const lockedUntil =
      parsed.data.lockedUntil && parsed.data.isLocked
        ? new Date(parsed.data.lockedUntil)
        : null;

    await prisma.savingsAccount.update({
      where: { id: savingsAccountId },
      data: {
        name: parsed.data.name,
        description: parsed.data.description?.trim() || null,
        targetAmount: targetAmount !== null ? targetAmount : null,
        status: parsed.data.status,
        isLocked: parsed.data.isLocked,
        lockedUntil,
      },
    });

    await logAuditEvent({
      actorUserId: userId,
      action: "savings-account.updated",
      entityType: "SavingsAccount",
      entityId: savingsAccountId,
      description: `Updated savings account ${parsed.data.name}.`,
      metadata: {
        previous: account,
        next: {
          name: parsed.data.name,
          description: parsed.data.description,
          targetAmount: parsed.data.targetAmount,
          status: parsed.data.status,
          isLocked: parsed.data.isLocked,
          lockedUntil: parsed.data.lockedUntil,
        },
      },
    });

    revalidatePath("/account/dashboard/super-admin/savings-accounts");
    revalidatePath(`/account/dashboard/super-admin/savings-accounts/${savingsAccountId}`);

    return {
      status: "success",
      message: "Savings account updated successfully.",
      redirectHref: `/account/dashboard/super-admin/savings-accounts/${savingsAccountId}`,
    };
  } catch (error) {
    console.error(error);

    return createErrorFormState(
      getFriendlyServerError(
        error,
        "Something went wrong while updating this savings account.",
      ),
    ) as UpdateSuperAdminSavingsAccountState;
  }
}
