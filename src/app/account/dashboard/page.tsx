import { redirect } from "next/navigation";

import { getDashboardHomeByRole } from "@/lib/auth/dashboard-home";
import { getCurrentUserRole } from "@/lib/getCurrentUser";

export default async function AccountDashboardIndexPage() {
  const role = await getCurrentUserRole();

  if (!role) {
    redirect("/auth/login");
  }

  redirect(getDashboardHomeByRole(role));
}
