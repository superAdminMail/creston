import { getSuperAdminSystemHealth } from "@/actions/super-admin/system-health/getSuperAdminSystemHealth";

import { SystemHealthClient } from "./_components/SystemHealthClient";

export default async function SuperAdminSystemHealthPage() {
  const health = await getSuperAdminSystemHealth();

  return <SystemHealthClient health={health} />;
}
