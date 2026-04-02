import { getDashboardHomeByRole } from "./dashboard-home";

type KnownRole = "USER" | "MODERATOR" | "ADMIN" | "SUPER_ADMIN";
type StaffRole = Exclude<KnownRole, "USER">;

const STAFF_ROLES = new Set<StaffRole>(["ADMIN", "SUPER_ADMIN", "MODERATOR"]);

export const getDashboardRedirectForRole = (
  role: string | null | undefined,
): string | null => {
  if (!role) return null;
  return getDashboardHomeByRole(role);
};

export const isStaffRole = (
  role: string | null | undefined,
): role is StaffRole => {
  if (!role) return false;
  return STAFF_ROLES.has(role as StaffRole);
};
