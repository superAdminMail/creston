import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

import { getCurrentUser } from "@/lib/getCurrentUser";

const roleRedirectMap = {
  USER: "/account/dashboard/user",
  MODERATOR: "/account/dashboard/moderator",
  ADMIN: "/account/dashboard/admin",
  SUPER_ADMIN: "/account/dashboard/super-admin",
} as const;

export default async function AccountDashboardPage() {
  const dbUser = await getCurrentUser();

  if (!dbUser?.id) {
    redirect("/auth/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: dbUser.id },
    select: { role: true },
  });

  if (!user) {
    redirect("/auth/login");
  }

  const destination = roleRedirectMap[user.role] ?? "/auth/login";

  redirect(destination);
}
