import { prisma } from "@/lib/prisma";
import { SupportVerificationStatus } from "@/generated/prisma/client";

export async function getCurrentUserSupportVerification(userId: string) {
  const verification = await prisma.supportVerification.findFirst({
    where: {
      userId,
      show: true,
      status: SupportVerificationStatus.PENDING,
    },
    orderBy: {
      requestedAt: "desc",
    },
    select: {
      id: true,
      representativeName: true,
      department: true,
      reason: true,
      requestedAt: true,
      expiresAt: true,
      status: true,
    },
  });

  if (!verification) {
    return null;
  }

  if (verification.expiresAt && verification.expiresAt <= new Date()) {
    await prisma.supportVerification.update({
      where: {
        id: verification.id,
      },
      data: {
        show: false,
        status: SupportVerificationStatus.EXPIRED,
      },
    });

    return null;
  }

  return verification;
}
