"use server";

import { revalidatePath } from "next/cache";

import { UserAccountStatus } from "@/generated/prisma";
import {
  createErrorFormState,
  createSuccessFormState,
  getFriendlyServerError,
  type FormActionState,
} from "@/lib/forms/actionState";
import { prisma } from "@/lib/prisma";
import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";

type FieldName = "userId";

export type SuspendUserState = FormActionState<FieldName>;

export async function suspendUserAction(
  _previousState: SuspendUserState,
  formData: FormData,
): Promise<SuspendUserState> {
  const { userId: actorUserId } = await requireSuperAdminAccess();
  const parsedUserId = formData.get("userId");

  if (typeof parsedUserId !== "string" || !parsedUserId.trim()) {
    return createErrorFormState("Please select a valid user.");
  }

  if (parsedUserId.trim() === actorUserId) {
    return createErrorFormState("You cannot suspend your own account.");
  }

  try {
    const targetUser = await prisma.user.findUnique({
      where: {
        id: parsedUserId.trim(),
      },
      select: {
        id: true,
        isDeleted: true,
        isSuspended: true,
        accountStatus: true,
      },
    });

    if (!targetUser) {
      return createErrorFormState("User not found.");
    }

    if (
      targetUser.isDeleted ||
      targetUser.accountStatus === UserAccountStatus.DELETED
    ) {
      return createErrorFormState(
        "This account has already been deleted and cannot be suspended.",
      );
    }

    if (
      targetUser.isSuspended ||
      targetUser.accountStatus === UserAccountStatus.SUSPENDED ||
      targetUser.accountStatus === UserAccountStatus.BLOCKED
    ) {
      return createSuccessFormState("Account is already suspended.");
    }

    await prisma.user.update({
      where: {
        id: targetUser.id,
      },
      data: {
        isSuspended: true,
        suspendedAt: new Date(),
        accountStatus: UserAccountStatus.SUSPENDED,
      },
    });

    revalidatePath("/account/dashboard/super-admin/users");
    revalidatePath("/account/dashboard/admin/users");
    revalidatePath("/account/dashboard/super-admin/system-health");

    return createSuccessFormState("User suspended successfully.");
  } catch (error) {
    return createErrorFormState(
      getFriendlyServerError(
        error,
        "Unable to suspend this user right now.",
      ),
    );
  }
}
