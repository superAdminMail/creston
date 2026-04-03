import { redirect } from "next/navigation";

import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { getCurrentUserRole } from "@/lib/getCurrentUser";

export type SuperAdminAccessContext = {
  userId: string;
};

export async function requireSuperAdminAccess(): Promise<SuperAdminAccessContext> {
  const sessionUser = await getCurrentSessionUser();

  if (!sessionUser?.id) {
    redirect("/auth/login");
  }

  const role = await getCurrentUserRole();

  if (role !== "SUPER_ADMIN") {
    redirect("/403");
  }

  return {
    userId: sessionUser.id,
  };
}
