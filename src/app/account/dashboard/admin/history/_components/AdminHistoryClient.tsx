import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters/formatters";
import type { AdminHistoryData } from "@/lib/service/getAdminHistoryData";

import { AdminOperationsShell } from "../../_components/AdminOperationsShell";
import { AdminResponsiveCollectionShell } from "../../_components/AdminResponsiveCollectionShell";

const heroPillClass =
  "inline-flex items-center rounded-full border border-sky-200/70 bg-sky-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-700 shadow-sm dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300";

const summaryPillClass =
  "inline-flex items-center rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08] dark:hover:text-white";

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function AdminHistoryClient({ data }: { data: AdminHistoryData }) {
  const stats = [
    {
      title: "Active investors",
      value: formatCompactNumber(data.summary.activeInvestors),
      hint: "Investor profiles with at least one confirmed order",
    },
    {
      title: "Confirmed orders",
      value: formatCompactNumber(data.summary.confirmedOrders),
      hint: "Orders already recorded in the ledger",
    },
    {
      title: "Total principal",
      value: formatCurrency(data.summary.totalPrincipal, data.summary.currency),
      hint: "Capital committed across confirmed orders",
    },
    {
      title: "Portfolio balance",
      value: formatCurrency(
        data.summary.totalAccountBalance,
        data.summary.currency,
      ),
      hint: "Principal plus recognized earnings",
    },
  ];

  return (
    <AdminOperationsShell
      title="Accounting History"
      description="A ledger-style summary of active investor portfolios derived from confirmed orders, realized earnings, and cumulative account balances."
      stats={stats}
      showTitleIcon={false}
    >
      <AdminResponsiveCollectionShell
        items={data.investors}
        getItemKey={(investor) => investor.id}
        emptyState={
          <Card className="rounded-[1.9rem] border border-slate-200/80 bg-white/90 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <CardContent className="space-y-3 p-8">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                No active investor history yet
              </h2>
              <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
                Investor portfolios will appear here once confirmed investment
                orders start flowing into the ledger.
              </p>
            </CardContent>
          </Card>
        }
        columns={[
          {
            key: "investor",
            header: "Investor",
            render: (investor) => (
              <div>
                <p className="text-sm font-semibold text-slate-950 dark:text-white">
                  {investor.name}
                </p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  {investor.email}
                </p>
              </div>
            ),
          },
          {
            key: "confirmedOrdersCount",
            header: "Confirmed orders",
            className: "px-5 py-4 text-right text-slate-600 dark:text-slate-400",
            cellClassName: "px-5 py-4 align-top text-right",
            render: (investor) => (
              <Badge className={summaryPillClass}>
                {formatCompactNumber(investor.confirmedOrdersCount)}
              </Badge>
            ),
          },
          {
            key: "principal",
            header: "Principal",
            className: "px-5 py-4 text-right text-slate-600 dark:text-slate-400",
            cellClassName: "px-5 py-4 align-top text-right",
            render: (investor) => (
              <p className="text-sm font-medium text-sky-700 dark:text-sky-300">
                {formatCurrency(investor.totalPrincipal, investor.currency)}
              </p>
            ),
          },
          {
            key: "earnings",
            header: "Earnings",
            className: "px-5 py-4 text-right text-slate-600 dark:text-slate-400",
            cellClassName: "px-5 py-4 align-top text-right",
            render: (investor) => (
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                {formatCurrency(investor.totalEarnedProfit, investor.currency)}
              </p>
            ),
          },
          {
            key: "accountBalance",
            header: "Account balance",
            className: "px-5 py-4 text-right text-slate-600 dark:text-slate-400",
            cellClassName: "px-5 py-4 align-top text-right",
            render: (investor) => (
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                {formatCurrency(investor.accountBalance, investor.currency)}
              </p>
            ),
          },
          {
            key: "latestOrder",
            header: "Latest order",
            render: (investor) => (
              <div>
                <p className="text-sm font-medium text-slate-950 dark:text-white">
                  {investor.latestPlanName}
                </p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  Confirmed {investor.latestConfirmedAtLabel}
                </p>
              </div>
            ),
          },
        ]}
      />
    </AdminOperationsShell>
  );
}
