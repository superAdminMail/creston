type KnownRole = "USER" | "MODERATOR" | "ADMIN" | "SUPER_ADMIN";
type StaffRole = Exclude<KnownRole, "USER">;

const ROLE_DASHBOARD: Record<KnownRole, string> = {
  SUPER_ADMIN: "/account/dashboard/super-admin",
  ADMIN: "/account/dashboard/admin",
  MODERATOR: "/account/dashboard/moderator",
  USER: "/account/dashboard/user",
};

const STAFF_ROLES = new Set<StaffRole>(["ADMIN", "SUPER_ADMIN", "MODERATOR"]);

export const getDashboardRedirectForRole = (
  role: string | null | undefined,
): string | null => {
  if (!role) return null;
  return ROLE_DASHBOARD[role as KnownRole] ?? null;
};

export const isStaffRole = (
  role: string | null | undefined,
): role is StaffRole => {
  if (!role) return false;
  return STAFF_ROLES.has(role as StaffRole);
};
