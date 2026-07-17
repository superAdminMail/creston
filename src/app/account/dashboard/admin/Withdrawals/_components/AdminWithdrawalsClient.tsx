import { Card, CardContent } from "@/components/ui/card";
import type { AdminWithdrawalItem } from "@/lib/service/getAdminWithdrawals";

import { WithdrawalRequestsTable } from "../../../_components/WithdrawalRequestsTable";

export default function AdminWithdrawalsClient({
  withdrawals,
  detailsBasePath = "/account/dashboard/admin/Withdrawals",
}: {
  withdrawals: AdminWithdrawalItem[];
  detailsBasePath?: string;
}) {
  return (
    <div className="space-y-6">
      <Card className="border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(8,17,37,0.98))] shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
        <CardContent className="space-y-6 p-6">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-300/80">
              Withdrawal Operations
            </p>
            <h1 className="text-2xl font-semibold text-white">Withdrawals</h1>
            <p className="max-w-3xl text-sm text-slate-400">
              Review withdrawal requests, inspect payout details, and track
              lifecycle status across pending, approved, rejected, and cancelled
              requests.
            </p>
          </div>
        </CardContent>
      </Card>

      <WithdrawalRequestsTable
        withdrawals={withdrawals}
        detailsBasePath={detailsBasePath}
      />
    </div>
  );
}
