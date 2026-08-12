"use server";

import { UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/getCurrentUser";

export type SupportVerificationPreview = {
  id: string;
  user: {
    id: string;
    name: string;
    email: string | null;
  };
  representativeName: string;
  department: string;
  reason: string;
  status: string;
  requestedAt: Date;
  confirmedAt: Date | null;
  expiresAt: Date | null;
};

export async function getSupportVerificationsAction(): Promise<
  | {
      success: true;
      verifications: SupportVerificationPreview[];
    }
  | {
      success: false;
      error: string;
      verifications: [];
    }
> {
  try {
    const currentUserId = await getCurrentUserId();

    if (!currentUserId) {
      return {
        success: false,
        error: "You must be logged in.",
        verifications: [],
      };
    }

    const currentUser = await prisma.user.findUnique({
      where: {
        id: currentUserId,
      },
      select: {
        role: true,
      },
    });

    if (
      !currentUser ||
      (currentUser.role !== UserRole.ADMIN &&
        currentUser.role !== UserRole.SUPER_ADMIN)
    ) {
      return {
        success: false,
        error: "You are not authorized to view support verifications.",
        verifications: [],
      };
    }

    const verifications = await prisma.supportVerification.findMany({
      orderBy: {
        requestedAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      success: true,
      verifications,
    };
  } catch (error) {
    console.error("getSupportVerificationsAction error:", error);

    return {
      success: false,
      error: "Unable to load support verifications.",
      verifications: [],
    };
  }
}
