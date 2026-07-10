import { redirect } from "next/navigation";

import {
  DASHBOARD_CONTINUE_SPLASH_DURATION_MS,
  resolveAuthenticatedDashboardTarget,
} from "@/lib/auth/dashboard-continue";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async function AccountContinuePage() {
  await delay(DASHBOARD_CONTINUE_SPLASH_DURATION_MS);

  const target = await resolveAuthenticatedDashboardTarget();

  redirect(target);
}
