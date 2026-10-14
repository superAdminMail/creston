"use server";

import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type DeactivationResult =
  | { success: true; deactivatedAt: Date }
  | { error: string };

export async function deactivateCurrentUserAccount(): Promise<DeactivationResult> {
  const sessionUser = await getCurrentSessionUser();

  if (!sessionUser) {
    return { error: "Unauthorized" };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const account = await tx.user.findUnique({
        where: { id: sessionUser.id },
        select: {
          id: true,
          emailVerified: true,
          accountStatus: true,
          isDeleted: true,
          isSuspended: true,
        },
      });

      if (!account) {
        return { error: "Account not found" } as const;
      }

      if (!account.emailVerified) {
        return {
          error: "Please contact support to resolve your unverified account.",
        } as const;
      }

      if (account.isDeleted || account.accountStatus === "DELETED") {
        return {
          error: "This account has already been deleted.",
        } as const;
      }

      if (account.accountStatus === "DEACTIVATED") {
        return {
          error: "This account is already deactivated.",
        } as const;
      }

      if (
        account.isSuspended ||
        account.accountStatus === "SUSPENDED" ||
        account.accountStatus === "BLOCKED"
      ) {
        return {
          error:
            "Suspended accounts cannot be deactivated here. Please contact support.",
        } as const;
      }

      if (account.accountStatus !== "ACTIVE") {
        return {
          error:
            "This account is not eligible for deactivation. Please contact support.",
        } as const;
      }

      const now = new Date();

      const update = await tx.user.updateMany({
        where: {
          id: account.id,
          emailVerified: true,
          accountStatus: "ACTIVE",
          isDeleted: false,
          isSuspended: false,
        },
        data: {
          accountStatus: "DEACTIVATED",
          deactivatedAt: now,
        },
      });

      if (update.count !== 1) {
        return {
          error: "The account status has changed. Refresh and try again.",
        } as const;
      }

      await tx.session.deleteMany({
        where: { userId: account.id },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: account.id,
          action: "USER_ACCOUNT_DEACTIVATED",
          entityType: "USER",
          entityId: account.id,
          description: "User deactivated their own account.",
          metadata: {
            source: "ACCOUNT_SETTINGS",
          },
        },
      });

      return {
        success: true,
        deactivatedAt: now,
      } as const;
    });

    if ("success" in result && result.success) {
      revalidatePath("/account");
      revalidatePath("/account/dashboard");
      return result;
    }

    return result;
  } catch (error) {
    console.error("Account deactivation failed:", error);

    return {
      error:
        "We couldn't deactivate your account. Please try again or contact support.",
    };
  }
}
