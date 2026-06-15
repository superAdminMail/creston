import { getAdminHistoryData } from "@/lib/service/getAdminHistoryData";

import { AdminHistoryClient } from "./_components/AdminHistoryClient";

export default async function AdminHistoryPage() {
  const data = await getAdminHistoryData();

  return <AdminHistoryClient data={data} />;
}
