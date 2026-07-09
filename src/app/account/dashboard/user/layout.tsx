import type { ReactNode } from "react";

import { DashboardRouteShell } from "../_components/DashboardRouteShell";

export default function UserDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <DashboardRouteShell>{children}</DashboardRouteShell>;
}
