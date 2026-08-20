"use server";

import { revalidatePath } from "next/cache";
import { SupportVerificationStatus } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import { createSupportVerificationSchema } from "@/lib/zodValidations/supportVerification";
import { SUPPORT_VERIFICATION_EXPIRY_MINUTES } from "@/lib/support/supportVerificationConstants";
import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";
import { getSupportVerificationCopy } from "@/lib/support/supportVerificationCopy";

export type CreateSupportVerificationActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  supportVerificationId?: string;
};

export async function createSupportVerificationAction(
  _prevState: CreateSupportVerificationActionState,
  formData: FormData,
): Promise<CreateSupportVerificationActionState> {
  const sessionUser = await requireDashboardRoleAccess([
    "ADMIN",
    "SUPER_ADMIN",
  ]);

  if (!sessionUser?.userId) {
    return {
      status: "error",
      message: "Unauthorized.",
    };
  }

  const rawInput = {
    userId: String(formData.get("userId") ?? ""),
    representativeName: String(formData.get("representativeName") ?? ""),
    department: String(formData.get("department") ?? ""),
    reason: String(formData.get("reason") ?? ""),
  };

  const parsed = createSupportVerificationSchema.safeParse(rawInput);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];

    return {
      status: "error",
      message: firstIssue?.message ?? "Invalid support verification input.",
    };
  }

  const input = parsed.data;

  try {
    const site = await getSiteConfigurationCached();
    const supportVerificationCopy = getSupportVerificationCopy(site?.siteName);

    const user = await prisma.user.findUnique({
      where: {
        id: input.userId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        isDeleted: true,
      },
    });

    if (!user || user.isDeleted) {
      return {
        status: "error",
        message: "The selected customer was not found.",
      };
    }

    const supportVerification = await prisma.$transaction(async (tx) => {
      await tx.supportVerification.updateMany({
        where: {
          userId: user.id,
          show: true,
          status: SupportVerificationStatus.PENDING,
        },
        data: {
          show: false,
          status: SupportVerificationStatus.CANCELLED,
        },
      });

      const requestedAt = new Date();

      const expiresAt = new Date(
        requestedAt.getTime() + SUPPORT_VERIFICATION_EXPIRY_MINUTES * 60 * 1000,
      );

      const verification = await tx.supportVerification.create({
        data: {
          userId: user.id,
          createdById: sessionUser.userId,

          representativeName: input.representativeName,
          department: input.department,
          reason: input.reason,

          status: SupportVerificationStatus.PENDING,
          show: true,

          requestedAt,
          expiresAt,
        },

        select: {
          id: true,
          userId: true,
          representativeName: true,
          department: true,
          reason: true,
          status: true,
          show: true,
          requestedAt: true,
          expiresAt: true,
        },
      });

      await tx.notification.create({
        data: {
          userId: user.id,

          title: supportVerificationCopy.notificationTitle,

          message: supportVerificationCopy.notificationMessage,

          type: "SUPPORT_VERIFICATION",

          key: `support-verification:${verification.id}`,

          metadata: {
            supportVerificationId: verification.id,
            representativeName: verification.representativeName,
            department: verification.department,
            reason: verification.reason,
            requestedAt: verification.requestedAt.toISOString(),
            expiresAt: verification.expiresAt?.toISOString() ?? null,
            actionLabel: "Confirm this support session",
          },
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: sessionUser.userId,

          action: "SUPPORT_VERIFICATION_CREATED",

          entityType: "SupportVerification",

          entityId: verification.id,

          description: "Created a support verification request for a customer.",

          metadata: {
            userId: user.id,
            userEmail: user.email,

            representativeName: verification.representativeName,

            department: verification.department,

            reason: verification.reason,

            status: verification.status,

            show: verification.show,
          },
        },
      });

      return verification;
    });

    revalidatePath("/account/dashboard/admin");
    revalidatePath("/account/dashboard/user");

    return {
      status: "success",
      message: `Support verification sent to ${user.email}.`,
      supportVerificationId: supportVerification.id,
    };
  } catch (error) {
    console.error("createSupportVerificationAction error:", error);

    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Unable to send support verification.",
    };
  }
}
