import AdminDepositsClient from "./_components/AdminDepositsClient";
import { getAdminDeposits } from "./_lib/getAdminDeposits";

export default async function AdminDepositsPage() {
  const deposits = await getAdminDeposits();

  return <AdminDepositsClient deposits={deposits} />;
}
