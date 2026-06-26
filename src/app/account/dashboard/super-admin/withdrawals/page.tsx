import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import { getAdminWithdrawals } from "@/lib/service/getAdminWithdrawals";

import { SuperAdminWithdrawalsClient } from "./_components/SuperAdminWithdrawalsClient";

export const dynamic = "force-dynamic";

export default async function SuperAdminWithdrawalsPage() {
  await requireDashboardRoleAccess(["SUPER_ADMIN"]);

  const withdrawals = await getAdminWithdrawals();
  return <SuperAdminWithdrawalsClient withdrawals={withdrawals} />;
}
