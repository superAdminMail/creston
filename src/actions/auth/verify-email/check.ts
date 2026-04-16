"use server";

import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { prisma } from "@/lib/prisma";

export async function getEmailVerificationStatusAction() {
  const sessionUser = await getCurrentSessionUser();

  if (!sessionUser?.id) {
    return {
      authenticated: false,
      emailVerified: false,
      accountStatus: null as null | string,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      emailVerified: true,
      accountStatus: true,
      emailVerifiedAt: true,
    },
  });

  if (!user) {
    return {
      authenticated: false,
      emailVerified: false,
      accountStatus: null as null | string,
    };
  }

  if (user.emailVerified && user.accountStatus !== "ACTIVE") {
    const verifiedAt = user.emailVerifiedAt ?? new Date();

    await prisma.user.update({
      where: { id: sessionUser.id },
      data: {
        accountStatus: "ACTIVE",
        emailVerifiedAt: verifiedAt,
      },
    });

    return {
      authenticated: true,
      emailVerified: true,
      accountStatus: "ACTIVE",
    };
  }

  return {
    authenticated: true,
    emailVerified: user.emailVerified,
    accountStatus: user.accountStatus,
  };
}
