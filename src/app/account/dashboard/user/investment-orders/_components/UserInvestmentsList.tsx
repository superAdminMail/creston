import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileText,
  Landmark,
  XCircle,
} from "lucide-react";

import { InvestmentOrderStatus } from "@/generated/prisma";
import type { UserInvestmentOrdersData } from "@/actions/investment-order/getUserInvestmentOrders";
import { UserInvestmentOrderCard } from "./UserInvestmentOrderCard";
import { UserInvestmentsEmptyState } from "./UserInvestmentsEmptyState";

type UserInvestmentsListProps = {
  data: UserInvestmentOrdersData;
  createdOrderId?: string | null;
  siteName: string;
};

const statusSummaryConfig = [
  {
    id: "pending",
    key: InvestmentOrderStatus.PENDING_PAYMENT,
    label: "Pending payment",
    icon: Clock3,
    tone: "amber",
  },
  {
    id: "confirmed",
    key: InvestmentOrderStatus.CONFIRMED,
    label: "Confirmed",
    icon: CheckCircle2,
    tone: "emerald",
  },
  {
    id: "cancelled",
    key: InvestmentOrderStatus.CANCELLED,
    label: "Cancelled",
    icon: XCircle,
    tone: "slate",
  },
  {
    id: "rejected",
    key: InvestmentOrderStatus.REJECTED,
    label: "Rejected",
    icon: AlertCircle,
    tone: "rose",
  },
] as const;

const summaryTone = {
  amber: {
    icon: "bg-amber-500/10 text-amber-500",
    value: "text-amber-700 dark:text-amber-300",
  },
  emerald: {
    icon: "bg-emerald-500/10 text-emerald-500",
    value: "text-emerald-700 dark:text-emerald-300",
  },
  slate: {
    icon: "bg-slate-500/10 text-slate-500",
    value: "text-slate-700 dark:text-slate-300",
  },
  rose: {
    icon: "bg-rose-500/10 text-rose-500",
    value: "text-rose-700 dark:text-rose-300",
  },
};

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
      {createdOrderId && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200/70 bg-emerald-50/80 p-4 dark:border-emerald-400/20 dark:bg-emerald-500/[0.08]">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-emerald-950 dark:text-emerald-100">
              Investment order created successfully
            </p>
            <p className="mt-1 text-sm leading-6 text-emerald-800/80 dark:text-emerald-200/80">
              Your order reference is{" "}
              <span className="font-semibold text-emerald-950 dark:text-white">
                {createdOrderId}
              </span>
              . You can now track its payment and confirmation progress here.
            </p>
          </div>
        </div>
      )}

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Landmark className="h-4 w-4 text-blue-500" />
              <h2 className="text-base font-semibold text-slate-950 dark:text-white">
                Order overview
              </h2>
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              A summary of your investment order activity.
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
            <FileText className="h-3.5 w-3.5" />
            {data.orders.length} {data.orders.length === 1 ? "order" : "orders"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {statusSummaryConfig.map((item) => {
            const Icon = item.icon;
            const tone = summaryTone[item.tone];

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-border/60 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.035]"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {item.label}
                  </p>

                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tone.icon}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                <p
                  className={`mt-3 text-2xl font-semibold tracking-tight ${tone.value}`}
                >
                  {data.counts[item.key]}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border/60 pb-4 dark:border-white/10">
          <div>
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
              Your orders
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Review the details and current status of each investment.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {data.orders.map((order) => (
            <UserInvestmentOrderCard
              key={order.id}
              order={order}
              siteName={siteName}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
