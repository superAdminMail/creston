import { getAdminWithdrawals } from "@/lib/service/getAdminWithdrawals";
import AdminWithdrawalsClient from "./_components/AdminWithdrawalsClient";

export default async function AdminWithdrawalsPage() {
  const withdrawals = await getAdminWithdrawals();

  return <AdminWithdrawalsClient withdrawals={withdrawals} />;
}
