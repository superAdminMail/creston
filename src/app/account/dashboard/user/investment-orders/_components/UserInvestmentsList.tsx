import Link from "next/link";
import { CheckCircle2, Landmark, Plus } from "lucide-react";

import { InvestmentOrderStatus } from "@/generated/prisma";
import type { UserInvestmentOrdersData } from "@/actions/investment-order/getUserInvestmentOrders";
import { UserInvestmentOrderCard } from "./UserInvestmentOrderCard";
import { UserInvestmentsEmptyState } from "./UserInvestmentsEmptyState";

type UserInvestmentsListProps = {
  data: UserInvestmentOrdersData;
  createdOrderId?: string | null;
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
    tone: "border-amber-400/15 bg-amber-400/8",
  },

  {
    id: "confirmed",
    key: InvestmentOrderStatus.CONFIRMED,
    label: "Confirmed",
    tone: "border-emerald-400/15 bg-emerald-400/8",
  },
  {
    id: "cancelled",
    key: InvestmentOrderStatus.CANCELLED,
    label: "Cancelled",
    tone: "border-slate-400/15 bg-slate-400/8",
  },
  {
    id: "rejected",
    key: InvestmentOrderStatus.REJECTED,
    label: "Rejected",
    tone: "border-rose-400/15 bg-rose-400/8",
  },
];

export function UserInvestmentsList({
  data,
  createdOrderId,
}: UserInvestmentsListProps) {
  if (data.orders.length === 0) {
    return (
      <UserInvestmentsEmptyState hasInvestorProfile={data.hasInvestorProfile} />
    );
  }

  return (
    <div className="space-y-6">
      {createdOrderId ? (
        <div className="rounded-[1.75rem] border border-emerald-400/20 bg-emerald-400/10 p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-300" />
            <div>
              <p className="text-sm font-semibold text-white">
                Investment order created successfully
              </p>
              <p className="mt-1 text-sm leading-6 text-emerald-100/85">
                Order reference{" "}
                <span className="font-medium text-white">{createdOrderId}</span>{" "}
                has been added to your investment list and is now pending
                payment.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <section className="card-premium overflow-hidden rounded-[2rem] p-5 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/15 bg-blue-400/8 px-3 py-1 text-xs font-medium text-blue-200">
              <Landmark className="h-3.5 w-3.5" />
              Order overview
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
              Manage your investment orders with clarity
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              Track payment, confirmation, and completed order activity across
              your Havenstone investment workflow.
            </p>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 xl:max-w-[34rem] 2xl:max-w-none">
            {statusSummaryConfig.map((item) => (
              <div
                key={item.id}
                className={`rounded-3xl border p-4 ${item.tone}`}
              >
                <p className="text-xs uppercase tracking-[0.14em] text-slate-200/75">
                  {item.label}
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
                  {data.counts[item.key]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        {data.orders.map((order) => (
          <UserInvestmentOrderCard key={order.id} order={order} />
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
