import {
  DASHBOARD_MENU,
  type DashboardRole,
} from "@/constants/dashboard-menu";

const FALLBACK_DASHBOARD_HOME = "/account/dashboard/user";

export const getDashboardHomeByRole = (
  role: string | null | undefined,
): string => {
  if (!role) return FALLBACK_DASHBOARD_HOME;

  const dashboardRole = role as DashboardRole;
  const firstSection = DASHBOARD_MENU[dashboardRole]?.[0];
  const firstLink = firstSection?.links[0];

  return firstLink?.href ?? FALLBACK_DASHBOARD_HOME;
};
