import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters/formatters";
import type { AdminHistoryData } from "@/lib/service/getAdminHistoryData";

import { AdminOperationsShell } from "../../_components/AdminOperationsShell";
import { AdminResponsiveCollectionShell } from "../../_components/AdminResponsiveCollectionShell";

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function HistoryMobileCard({
  investor,
}: {
  investor: AdminHistoryData["investors"][number];
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-base font-semibold text-white">{investor.name}</p>
        <p className="mt-1 text-sm text-slate-400">{investor.email}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge className="border border-white/10 bg-white/[0.05] px-2.5 py-1 text-slate-100 hover:bg-white/[0.05]">
          {formatCompactNumber(investor.confirmedOrdersCount)} confirmed
        </Badge>
        <Badge className="border border-sky-400/20 bg-sky-400/10 px-2.5 py-1 text-sky-100 hover:bg-sky-400/10">
          Principal {formatCurrency(investor.totalPrincipal, investor.currency)}
        </Badge>
        <Badge className="border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-emerald-100 hover:bg-emerald-400/10">
          Earnings {formatCurrency(investor.totalEarnedProfit, investor.currency)}
        </Badge>
      </div>

      <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
          Account balance
        </p>
        <p className="mt-2 text-lg font-semibold text-emerald-300">
          {formatCurrency(investor.accountBalance, investor.currency)}
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-400">
          Latest order: {investor.latestPlanName} | {investor.latestConfirmedAtLabel}
        </p>
      </div>
    </div>
  );
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
    >
      <AdminResponsiveCollectionShell
        items={data.investors}
        getItemKey={(investor) => investor.id}
        emptyState={
          <Card className="rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(8,17,37,0.98))] text-center shadow-[0_22px_60px_rgba(0,0,0,0.2)]">
            <CardContent className="space-y-3 p-8">
              <h2 className="text-lg font-semibold text-white">
                No active investor history yet
              </h2>
              <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-400">
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
                <p className="text-sm font-semibold text-white">
                  {investor.name}
                </p>
                <p className="mt-1 text-xs text-slate-400">{investor.email}</p>
              </div>
            ),
          },
          {
            key: "confirmedOrdersCount",
            header: "Confirmed orders",
            className: "px-5 py-4 text-right text-slate-400",
            cellClassName: "px-5 py-4 align-top text-right",
            render: (investor) => (
              <Badge className="border border-white/10 bg-white/[0.05] px-2.5 py-1 text-slate-100 hover:bg-white/[0.05]">
                {formatCompactNumber(investor.confirmedOrdersCount)}
              </Badge>
            ),
          },
          {
            key: "principal",
            header: "Principal",
            className: "px-5 py-4 text-right text-slate-400",
            cellClassName: "px-5 py-4 align-top text-right",
            render: (investor) => (
              <p className="text-sm font-medium text-sky-200">
                {formatCurrency(investor.totalPrincipal, investor.currency)}
              </p>
            ),
          },
          {
            key: "earnings",
            header: "Earnings",
            className: "px-5 py-4 text-right text-slate-400",
            cellClassName: "px-5 py-4 align-top text-right",
            render: (investor) => (
              <p className="text-sm font-medium text-emerald-200">
                {formatCurrency(investor.totalEarnedProfit, investor.currency)}
              </p>
            ),
          },
          {
            key: "accountBalance",
            header: "Account balance",
            className: "px-5 py-4 text-right text-slate-400",
            cellClassName: "px-5 py-4 align-top text-right",
            render: (investor) => (
              <p className="text-sm font-semibold text-emerald-300">
                {formatCurrency(investor.accountBalance, investor.currency)}
              </p>
            ),
          },
          {
            key: "latestOrder",
            header: "Latest order",
            render: (investor) => (
              <div>
                <p className="text-sm font-medium text-white">
                  {investor.latestPlanName}
                </p>
                <p className="mt-1 text-xs text-slate-400">
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
