import { redirect } from "next/navigation";

import { getCurrentUserRole } from "@/lib/getCurrentUser";
import { getDashboardHomeByRole } from "@/lib/auth/dashboard-home";

export default async function AccountDashboardPage() {
  const role = await getCurrentUserRole();

  if (!role) {
    redirect("/auth/login");
  }

  redirect(getDashboardHomeByRole(role));
}
