import { redirect } from "next/navigation";

import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { getCurrentUserRole } from "@/lib/getCurrentUser";
import type { DashboardRole } from "@/constants/dashboard-menu";

export type DashboardRoleAccessContext = {
  userId: string;
  role: DashboardRole;
};

export async function requireDashboardRoleAccess(
  allowedRoles: DashboardRole[],
): Promise<DashboardRoleAccessContext> {
  const sessionUser = await getCurrentSessionUser();

  if (!sessionUser?.id) {
    redirect("/auth/login");
  }

  const role = await getCurrentUserRole();

  if (
    !role ||
    !allowedRoles.includes(role as DashboardRole)
  ) {
    redirect("/403");
  }

  return {
    userId: sessionUser.id,
    role: role as DashboardRole,
  };
}
