import { redirect } from "next/navigation";

import {
  DASHBOARD_CONTINUE_SPLASH_DURATION_MS,
  resolveAuthenticatedDashboardTarget,
} from "@/lib/auth/dashboard-continue";

type ContinuePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async function AuthContinuePage({
  searchParams,
}: ContinuePageProps) {
  const params = (await searchParams) ?? {};
  await delay(DASHBOARD_CONTINUE_SPLASH_DURATION_MS);

  const target = await resolveAuthenticatedDashboardTarget(params.callbackUrl);

  redirect(target);
}
