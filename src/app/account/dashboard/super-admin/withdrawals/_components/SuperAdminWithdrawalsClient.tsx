import type { AdminWithdrawalItem } from "@/lib/service/getAdminWithdrawals";

import { SuperAdminPageHeader } from "../../_components/SuperAdminPageHeader";
import { SuperAdminStatCard } from "../../_components/SuperAdminStatCard";
import { WithdrawalRequestsTable } from "../../../_components/WithdrawalRequestsTable";

export function SuperAdminWithdrawalsClient({
  withdrawals,
}: {
  withdrawals: AdminWithdrawalItem[];
}) {
  const totalRequests = withdrawals.length;
  const pendingRequests = withdrawals.filter(
    (withdrawal) => withdrawal.status === "PENDING",
  ).length;
  const completedRequests = withdrawals.filter(
    (withdrawal) => withdrawal.status === "COMPLETED",
  ).length;
  const paymentMethodUpdatesNeeded = withdrawals.filter(
    (withdrawal) => withdrawal.paymentMethodStatus === "UNAVAILABLE",
  ).length;
  const commissionReviewsPending = withdrawals.filter(
    (withdrawal) => withdrawal.commissionReviewStatus === "PENDING_REVIEW",
  ).length;

  return (
    <div className="space-y-6 sm:space-y-8">
      <SuperAdminPageHeader
        backHref="/account/dashboard/super-admin"
        backLabel="Back to dashboard"
        title="Withdrawals"
        description="Super-admin queue for withdrawal requests, payout method availability checks, and lifecycle oversight across the platform."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SuperAdminStatCard
          label="Total requests"
          value={totalRequests}
          description="All withdrawal requests currently loaded in the queue."
        />
        <SuperAdminStatCard
          label="Pending review"
          value={pendingRequests}
          description="Requests still awaiting administrative action."
        />
        <SuperAdminStatCard
          label="Payout updates needed"
          value={paymentMethodUpdatesNeeded}
          description="Withdrawals whose selected payout method is unavailable."
        />
        <SuperAdminStatCard
          label="Commission reviews"
          value={commissionReviewsPending}
          description="Investment withdrawal commissions still awaiting review."
        />
      </section>

      <div className="rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(8,17,37,0.98))] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.25)] sm:p-6">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-300/80">
              Super-admin operations
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
              Withdrawal management
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
              Review payout details, inspect source information, and update
              statuses with a full platform-wide view.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-300 sm:self-auto">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            {completedRequests} completed
          </div>
        </div>

        <WithdrawalRequestsTable
          withdrawals={withdrawals}
          detailsBasePath="/account/dashboard/super-admin/withdrawals"
        />
      </div>
    </div>
  );
}
