import { getSuperAdminAuditLogs } from "@/actions/super-admin/audit-logs/getSuperAdminAuditLogs";

import { AuditLogsView } from "./_components/AuditLogsView";

export const dynamic = "force-dynamic";

export default async function SuperAdminAuditLogPage() {
  const data = await getSuperAdminAuditLogs();

  return <AuditLogsView data={data} />;
}
