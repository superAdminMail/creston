import { getDashboardHomeByRole } from "./dashboard-home";
import { requireActiveVerifiedUser } from "./requireActiveVerifiedUser";

export const DASHBOARD_CONTINUE_SPLASH_DURATION_MS = 450;

function getSingleParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function resolveTarget(
  callbackUrl: string | string[] | undefined,
  defaultTarget: string,
) {
  const normalized = getSingleParam(callbackUrl)?.trim();

  if (!normalized) return defaultTarget;
  if (!normalized.startsWith("/")) return defaultTarget;
  if (normalized.startsWith("/auth")) return defaultTarget;

  return normalized;
}

export async function resolveAuthenticatedDashboardTarget(
  callbackUrl?: string | string[] | undefined,
) {
  const user = await requireActiveVerifiedUser();
  const defaultTarget = getDashboardHomeByRole(user.role);

  return resolveTarget(callbackUrl, defaultTarget);
}
