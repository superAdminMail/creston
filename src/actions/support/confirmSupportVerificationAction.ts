"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/getCurrentUser";

export async function confirmSupportVerificationAction(verificationId: string) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return {
        success: false,
        error: "You must be logged in to confirm this support session.",
      };
    }

    if (!verificationId) {
      return {
        success: false,
        error: "Invalid support verification request.",
      };
    }

    const verification = await prisma.supportVerification.findFirst({
      where: {
        id: verificationId,
        userId,
      },
      select: {
        id: true,
        userId: true,
        status: true,
        show: true,
        expiresAt: true,
      },
    });

    if (!verification) {
      return {
        success: false,
        error: "Support verification request not found.",
      };
    }

    if (!verification.show) {
      return {
        success: false,
        error: "This support verification request is no longer available.",
      };
    }

    if (verification.status !== "PENDING") {
      return {
        success: false,
        error: "This support verification request is no longer active.",
      };
    }

    const now = new Date();

    // Server-side expiration check.
    if (verification.expiresAt && verification.expiresAt <= now) {
      await prisma.supportVerification.updateMany({
        where: {
          id: verification.id,
          userId,
          status: "PENDING",
          show: true,
        },
        data: {
          status: "EXPIRED",
          show: false,
        },
      });

      revalidatePath("/account/dashboard/user");
      revalidatePath("/account/dashboard/admin/support");

      return {
        success: false,
        error:
          "This support verification request has expired. Please ask the support representative to send a new request.",
      };
    }

    const confirmedAt = new Date();

    const result = await prisma.$transaction(async (tx) => {
      // Re-check the expiration and state as part of the actual update.
      // This prevents a request that expires between the initial read
      // and this update from being confirmed.
      const updated = await tx.supportVerification.updateMany({
        where: {
          id: verification.id,
          userId,
          status: "PENDING",
          show: true,
          OR: [
            {
              expiresAt: null,
            },
            {
              expiresAt: {
                gt: confirmedAt,
              },
            },
          ],
        },
        data: {
          status: "VERIFIED",
          confirmedAt,
          show: false,
        },
      });

      if (updated.count === 0) {
        return {
          confirmed: false,
        };
      }

      await tx.auditLog.create({
        data: {
          actorUserId: userId,
          action: "SUPPORT_VERIFICATION_CONFIRMED",
          entityType: "SupportVerification",
          entityId: verification.id,
          description: "Customer confirmed a support verification session.",
          metadata: {
            verificationId: verification.id,
          },
        },
      });

      return {
        confirmed: true,
      };
    });

    if (!result.confirmed) {
      return {
        success: false,
        error:
          "This support verification request has expired or is no longer active.",
      };
    }

    revalidatePath("/account/dashboard/user");
    revalidatePath("/account/dashboard/admin/support");

    return {
      success: true,
      message: "Support session confirmed.",
    };
  } catch (error) {
    console.error("confirmSupportVerificationAction error:", error);

    return {
      success: false,
      error: "Unable to confirm the support session. Please try again.",
    };
  }
}
