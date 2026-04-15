import { prisma } from "@/lib/prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { redirect } from "next/navigation";

export async function requireActiveVerifiedUser() {
  const sessionUser = await getCurrentSessionUser();

  if (!sessionUser?.id) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      emailVerified: true,
      accountStatus: true,
      isDeleted: true,
    },
  });

  if (!user || user.isDeleted) {
    throw new Error("Account unavailable");
  }

  if (!user.emailVerified || user.accountStatus !== "ACTIVE") {
    redirect("/auth/send-verify-email");
  }

  return user;
}
