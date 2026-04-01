import { redirect } from "next/navigation";

import type { DashboardRole } from "@/constants/dashboard-menu";
import { getCurrentUser } from "@/lib/getCurrentUser";

import DashboardLayoutClient from "./layout-client";

export default async function AccountDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user?.id) {
    redirect("/auth/login");
  }

  return (
    <DashboardLayoutClient
      userEmail={user.email}
      userImage={user.image}
      userName={user.name}
      userRole={user.role as DashboardRole}
    >
      {children}
    </DashboardLayoutClient>
  );
}
