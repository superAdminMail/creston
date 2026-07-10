import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { getDashboardHomeByRole } from "@/lib/auth/dashboard-home";
import { getCurrentUserRole } from "@/lib/getCurrentUser";
import { UserRole } from "@/generated/prisma/client";
import { DashboardRouteShell } from "../_components/DashboardRouteShell";

export default async function UserDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const role = await getCurrentUserRole();

  if (!role) {
    redirect("/auth/login");
  }

  if (role !== UserRole.USER) {
    redirect(getDashboardHomeByRole(role));
  }

  return <DashboardRouteShell>{children}</DashboardRouteShell>;
}
