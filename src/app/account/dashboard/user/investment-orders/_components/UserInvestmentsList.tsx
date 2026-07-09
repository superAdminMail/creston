import Link from "next/link";
import { CheckCircle2, Landmark, Plus } from "lucide-react";

import { InvestmentOrderStatus } from "@/generated/prisma";
import type { UserInvestmentOrdersData } from "@/actions/investment-order/getUserInvestmentOrders";
import { UserInvestmentOrderCard } from "./UserInvestmentOrderCard";
import { UserInvestmentsEmptyState } from "./UserInvestmentsEmptyState";

type UserInvestmentsListProps = {
  data: UserInvestmentOrdersData;
  createdOrderId?: string | null;
  siteName: string;
};

const statusSummaryConfig: Array<{
  id: string;
  key: InvestmentOrderStatus;
  label: string;
  tone: string;
}> = [
  {
    id: "pending-payment",
    key: InvestmentOrderStatus.PENDING_PAYMENT,
    label: "Pending payment",
    tone: "border-amber-200/70 bg-amber-50 text-amber-950 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-100",
  },

  {
    id: "confirmed",
    key: InvestmentOrderStatus.CONFIRMED,
    label: "Confirmed",
    tone: "border-emerald-200/70 bg-emerald-50 text-emerald-950 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-100",
  },
  {
    id: "cancelled",
    key: InvestmentOrderStatus.CANCELLED,
    label: "Cancelled",
    tone: "border-slate-200/80 bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300",
  },
  {
    id: "rejected",
    key: InvestmentOrderStatus.REJECTED,
    label: "Rejected",
    tone: "border-rose-200/70 bg-rose-50 text-rose-950 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-100",
  },
];

export function UserInvestmentsList({
  data,
  createdOrderId,
  siteName,
}: UserInvestmentsListProps) {
  if (data.orders.length === 0) {
    return (
      <UserInvestmentsEmptyState
        hasInvestorProfile={data.hasInvestorProfile}
        siteName={siteName}
      />
    );
  }

  return (
    <div className="space-y-6">
      {createdOrderId ? (
        <div className="rounded-[1.75rem] border border-emerald-200/70 bg-emerald-50/90 p-5 shadow-sm dark:border-emerald-400/20 dark:bg-emerald-500/10">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-300" />
            <div>
              <p className="text-sm font-semibold text-emerald-950 dark:text-white">
                Order created successfully
              </p>
              <p className="mt-1 text-sm leading-6 text-emerald-900/80 dark:text-emerald-100/85">
                Reference{" "}
                <span className="font-medium text-emerald-950 dark:text-white">
                  {createdOrderId}
                </span>{" "}
                is now in your order list and waiting for payment.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <section className="overflow-hidden rounded-[2rem] border border-border/60 bg-white/75 p-5 shadow-sm sm:p-6 lg:p-8 dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200/70 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800 shadow-sm dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200">
              <Landmark className="h-3.5 w-3.5" />
              Order snapshot
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-3xl dark:text-white">
              Portfolio order overview
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base dark:text-slate-400">
              Monitor payment, confirmation, and completion milestones across
              your {siteName} investment workflow.
            </p>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 xl:max-w-[34rem] 2xl:max-w-none">
            {statusSummaryConfig.map((item) => (
              <div
                key={item.id}
                className={`rounded-3xl border p-4 shadow-sm ${item.tone}`}
              >
                <p className="text-xs uppercase tracking-[0.16em] text-slate-600 dark:text-slate-200/75">
                  {item.label}
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
                  {data.counts[item.key]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        {data.orders.map((order) => (
          <UserInvestmentOrderCard
            key={order.id}
            order={order}
            siteName={siteName}
          />
        ))}
      </section>

      <div className="flex justify-end">
        <Link
          href="/account/dashboard/user/investment-orders/new"
          className="btn-primary inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
        >
          <Plus className="h-4 w-4" />
          New order
        </Link>
      </div>
    </div>
  );
}
