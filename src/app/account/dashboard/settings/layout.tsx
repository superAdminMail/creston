import type { ReactNode } from "react";

import { DashboardRouteShell } from "../_components/DashboardRouteShell";

export default function SettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <DashboardRouteShell>{children}</DashboardRouteShell>;
}
