type SupportRole = "USER" | "ADMIN" | "MODERATOR" | "SUPER_ADMIN";

const SUPPORT_TICKET_ROUTES: Record<SupportRole, string> = {
  USER: "/account/dashboard/user/support",
  ADMIN: "/account/dashboard/admin/support",
  MODERATOR: "/account/dashboard/moderator/support",
  SUPER_ADMIN: "/account/dashboard/super-admin/support",
};

export function getSupportTicketRoute(role: SupportRole): string {
  return SUPPORT_TICKET_ROUTES[role];
}
