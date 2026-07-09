import type { ReactNode } from "react";

import { DASHBOARD_PAGE_SHELL_CLASS } from "../_components/dashboardSurfaces";

export default function SuperAdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <div className={DASHBOARD_PAGE_SHELL_CLASS}>{children}</div>;
}
