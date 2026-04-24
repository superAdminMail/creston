"use client";

import Link from "next/link";
import { formatCurrency, formatDateLabel } from "@/lib/formatters/formatters";
import type { WithdrawalRequestItemDto } from "@/lib/types/withdrawalRequests";

type Props = {
  withdrawalOrders: WithdrawalRequestItemDto[];
};

function getMethodLabel(method?: WithdrawalRequestItemDto["payoutMethod"]) {
  if (!method) return "Payment method";

  if (method.type === "BANK") {
    return method.bankName ?? "Bank transfer";
  }

  if (method.type === "CRYPTO") {
    return method.network ?? "Crypto wallet";
  }

  return "Payment method";
}

function getSourceLabel(order: WithdrawalRequestItemDto) {
  return (
    order.investmentOrder?.investmentPlan?.name ??
    order.investmentAccount?.investmentPlan?.name ??
    "Withdrawal source"
  );
}

export default function WithdrawalRequestsList({ withdrawalOrders }: Props) {
  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div>
        <h4 className="text-sm font-medium text-white">Withdrawal Requests</h4>
        <p className="mt-1 text-xs text-slate-500">
          Recent withdrawal submissions and their current status.
        </p>
      </div>

      {withdrawalOrders.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {withdrawalOrders.map((order) => (
            <Link
              key={order.id}
              href={`/account/dashboard/user/withdrawals/${order.id}`}
              className="block rounded-2xl border border-white/10 bg-[#09111f]/70 p-4 transition hover:border-[#3c9ee0]/40 hover:bg-[#0d1729]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-white">
                    {formatCurrency(Number(order.amount), order.currency ?? "USD")}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {getSourceLabel(order)}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-300">
                  {order.status.toLowerCase()}
                </span>
              </div>

              <div className="mt-4 grid gap-3 text-xs text-slate-400 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    Payment Method
                  </p>
                  <p className="mt-1 text-sm text-slate-200">
                    {getMethodLabel(order.payoutMethod)}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    Requested
                  </p>
                  <p className="mt-1 text-sm text-slate-200">
                    {formatDateLabel(order.requestedAt)}
                  </p>
                </div>
              </div>

              {order.payoutSnapshot?.withdrawalMode ? (
                <p className="mt-3 text-xs text-slate-500">
                  {order.payoutSnapshot.withdrawalMode === "EARLY_WITHDRAWAL"
                    ? `Early withdrawal penalty applied: ${formatCurrency(
                        Number(order.payoutSnapshot.earlyWithdrawalPenalty ?? 0),
                        order.currency ?? "USD",
                      )}`
                  : "Normal withdrawal request"}
                </p>
              ) : null}
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">
          No withdrawal requests have been submitted yet.
        </div>
      )}
    </div>
  );
}
