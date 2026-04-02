import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/getCurrentUser";
import { getDashboardHomeByRole } from "@/lib/auth/dashboard-home";

export default async function AccountDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  redirect(getDashboardHomeByRole(user.role));
}
