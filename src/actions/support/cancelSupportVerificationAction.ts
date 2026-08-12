"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/getCurrentUser";
import { SupportVerificationStatus } from "@/generated/prisma/client";

export async function cancelSupportVerificationAction(verificationId: string) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return {
        success: false,
        error: "You must be logged in to dismiss this verification.",
      };
    }

    if (!verificationId) {
      return {
        success: false,
        error: "Invalid verification request.",
      };
    }

    const verification = await prisma.supportVerification.findFirst({
      where: {
        id: verificationId,
        userId,
        status: SupportVerificationStatus.PENDING,
        show: true,
      },
      select: {
        id: true,
      },
    });

    if (!verification) {
      return {
        success: false,
        error: "This support verification is no longer available.",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.supportVerification.update({
        where: {
          id: verification.id,
        },
        data: {
          status: SupportVerificationStatus.CANCELLED,
          show: false,
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: userId,
          action: "SUPPORT_VERIFICATION_CANCELLED",
          entityType: "SupportVerification",
          entityId: verification.id,
          description: "Customer dismissed a support verification request.",
          metadata: {
            verificationId: verification.id,
          },
        },
      });
    });

    revalidatePath("/account/dashboard/user");

    return {
      success: true,
      message: "Support verification dismissed.",
    };
  } catch (error) {
    console.error("[cancelSupportVerificationAction]", error);

    return {
      success: false,
      error: "Unable to dismiss the support verification.",
    };
  }
}
