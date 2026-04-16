import { redirect } from "next/navigation";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { prisma } from "@/lib/prisma";
import { getDashboardHomeByRole } from "@/lib/auth/dashboard-home";

export default async function AccountIndexPage() {
  const sessionUser = await getCurrentSessionUser();

  if (!sessionUser?.id) {
    redirect("/auth/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { role: true },
  });

  if (!user) {
    redirect("/auth/login");
  }

  redirect(getDashboardHomeByRole(user.role));
}
