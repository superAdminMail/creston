"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BadgePercent,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Filter,
  PiggyBank,
  ReceiptText,
  RotateCcw,
  Search,
  TrendingUp,
  Wallet,
} from "lucide-react";

import {
  formatCurrency,
  formatDateLabel,
  formatEnumLabel,
} from "@/lib/formatters/formatters";

import type {
  PaginatedTransactionsResult,
  TransactionDateRange,
  TransactionFilters,
  TransactionItem,
  TransactionType,
} from "@/lib/service/getUserTransactions";

type Props = PaginatedTransactionsResult & {
  filters: {
    type: TransactionType | "all";
    status: string;
    search: string;
    dateRange: TransactionDateRange;
    startDate: string;
    endDate: string;
    sort: "newest" | "oldest";
  };
};

const transactionTypes: Array<{
  label: string;
  value: TransactionType | "all";
}> = [
  { label: "All activity", value: "all" },
  { label: "Investment", value: "INVESTMENT" },
  { label: "Withdrawal", value: "WITHDRAWAL" },
  { label: "Earnings", value: "EARNING" },
  { label: "Adjustments", value: "ADJUSTMENT" },
  { label: "Savings", value: "SAVINGS" },
];

const dateRanges: Array<{
  label: string;
  value: TransactionDateRange;
}> = [
  { label: "All time", value: "all" },
  { label: "Today", value: "today" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
  { label: "Custom range", value: "custom" },
];

function getTransactionLabel(transaction: TransactionItem) {
  if (transaction.type === "SAVINGS" && transaction.savingsType) {
    return formatEnumLabel(transaction.savingsType);
  }

  return formatEnumLabel(transaction.type);
}

function getTransactionDescription(transaction: TransactionItem) {
  return (
    transaction.description ?? transaction.planName ?? transaction.reference
  );
}

function getTransactionIcon(transaction: TransactionItem) {
  switch (transaction.type) {
    case "WITHDRAWAL":
      return ArrowUpRight;
    case "EARNING":
      return TrendingUp;
    case "SAVINGS":
      return PiggyBank;
    case "ADJUSTMENT":
      return BadgePercent;
    default:
      return ArrowDownLeft;
  }
}

function getTransactionTone(transaction: TransactionItem) {
  if (transaction.direction === "DEBIT") {
    return {
      icon: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
      amount: "text-rose-700 dark:text-rose-400",
      sign: "-",
    };
  }

  return {
    icon: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    amount: "text-emerald-700 dark:text-emerald-400",
    sign: "+",
  };
}

function getStatusTone(status: TransactionItem["status"]) {
  const normalized = String(status).toUpperCase();

  if (
    normalized === "COMPLETED" ||
    normalized === "SUCCESS" ||
    normalized === "SUCCESSFUL" ||
    normalized === "APPROVED"
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300";
  }

  if (
    normalized === "FAILED" ||
    normalized === "REJECTED" ||
    normalized === "CANCELLED"
  ) {
    return "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-300";
  }

  if (
    normalized === "PENDING" ||
    normalized === "PROCESSING" ||
    normalized === "UNDER_REVIEW"
  ) {
    return "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-300";
  }

  return "border-slate-200 bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300";
}

function TransactionIcon({ transaction }: { transaction: TransactionItem }) {
  const Icon = getTransactionIcon(transaction);
  const tone = getTransactionTone(transaction);

  return (
    <div
      className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${tone.icon}`}
    >
      <Icon className="size-5" />
    </div>
  );
}

function TransactionCard({ transaction }: { transaction: TransactionItem }) {
  const tone = getTransactionTone(transaction);

  return (
    <article className="group flex min-w-0 flex-col gap-4 p-4 transition-colors hover:bg-slate-50/80 dark:hover:bg-white/[0.035] sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
      <div className="flex min-w-0 items-start gap-3">
        <TransactionIcon transaction={transaction} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="break-words text-sm font-semibold text-slate-950 dark:text-white">
              {getTransactionLabel(transaction)}
            </h3>

            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${getStatusTone(transaction.status)}`}
            >
              {formatEnumLabel(transaction.status)}
            </span>
          </div>

          <p className="mt-1 break-words text-xs leading-5 text-slate-600 dark:text-slate-400">
            {getTransactionDescription(transaction)}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="size-3" />
              {formatDateLabel(transaction.createdAt)}
            </span>

            <span className="hidden size-1 rounded-full bg-slate-300 sm:block dark:bg-slate-600" />

            <span className="break-all">Ref: {transaction.reference}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-slate-200/70 pt-3 sm:min-w-40 sm:flex-col sm:items-end sm:justify-center sm:border-0 sm:pt-0 dark:border-white/10">
        <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 sm:hidden">
          Amount
        </span>

        <p
          className={`break-words text-base font-bold tracking-tight sm:text-right ${tone.amount}`}
        >
          {tone.sign}
          {formatCurrency(transaction.amount, transaction.currency)}
        </p>
      </div>
    </article>
  );
}

function SummaryCard({
  title,
  icon: Icon,
  values,
  tone,
}: {
  title: string;
  icon: typeof Wallet;
  values: Array<{ currency: string; amount: number }>;
  tone: "emerald" | "rose";
}) {
  const isCredit = tone === "emerald";

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {title}
          </p>

          {values.length > 0 ? (
            <div className="mt-3 space-y-1.5">
              {values.map((item) => (
                <p
                  key={item.currency}
                  className={`break-words text-lg font-bold tracking-tight ${
                    isCredit
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-rose-700 dark:text-rose-400"
                  }`}
                >
                  {formatCurrency(item.amount, item.currency)}
                </p>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-lg font-bold text-slate-950 dark:text-white">
              —
            </p>
          )}
        </div>

        <div
          className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${
            isCredit
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
              : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
          }`}
        >
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}

export default function TransactionsHistoryClient({
  transactions,
  total,
  page,
  pageSize,
  totalPages,
  statuses,
  creditsByCurrency,
  debitsByCurrency,
  filters,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [search, setSearch] = useState(filters.search);
  const [type, setType] = useState(filters.type);
  const [status, setStatus] = useState(filters.status);
  const [dateRange, setDateRange] = useState(filters.dateRange);
  const [startDate, setStartDate] = useState(filters.startDate);
  const [endDate, setEndDate] = useState(filters.endDate);
  const [sort, setSort] = useState(filters.sort);
  const [selectedPageSize, setSelectedPageSize] = useState(String(pageSize));

  function navigate(
    overrides: Partial<TransactionFilters> = {},
    resetPage = true,
  ) {
    const params = new URLSearchParams();

    const next = {
      type,
      status,
      search,
      dateRange,
      startDate,
      endDate,
      sort,
      pageSize: selectedPageSize,
      ...overrides,
    };

    if (next.type && next.type !== "all") {
      params.set("type", next.type);
    }

    if (next.status && next.status !== "all") {
      params.set("status", next.status);
    }

    if (next.search?.trim()) {
      params.set("q", next.search.trim());
    }

    if (next.dateRange && next.dateRange !== "all") {
      params.set("range", next.dateRange);
    }

    if (next.dateRange === "custom") {
      if (next.startDate) params.set("start", next.startDate);
      if (next.endDate) params.set("end", next.endDate);
    }

    if (next.sort && next.sort !== "newest") {
      params.set("sort", next.sort);
    }

    if (Number(next.pageSize) !== 10) {
      params.set("pageSize", String(next.pageSize));
    }

    const nextPage = resetPage ? 1 : Number(overrides.page ?? page);

    if (nextPage > 1) {
      params.set("page", String(nextPage));
    }

    const query = params.toString();

    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function resetFilters() {
    setSearch("");
    setType("all");
    setStatus("all");
    setDateRange("all");
    setStartDate("");
    setEndDate("");
    setSort("newest");
    setSelectedPageSize("10");

    router.push(pathname);
  }

  const hasActiveFilters =
    filters.type !== "all" ||
    filters.status !== "all" ||
    Boolean(filters.search) ||
    filters.dateRange !== "all" ||
    filters.sort !== "newest";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-5 sm:px-6 sm:py-7">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-sky-800 dark:text-sky-300">
          <ReceiptText className="size-4" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em]">
            Account activity
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl dark:text-white">
          Transactions
        </h1>

        <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
          Review your investment, savings, earnings and withdrawal activity in
          one place.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Matching transactions
              </p>

              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
                {total.toLocaleString()}
              </p>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Based on your current filters
              </p>
            </div>

            <div className="flex size-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-800 dark:bg-sky-400/10 dark:text-sky-300">
              <Wallet className="size-5" />
            </div>
          </div>
        </div>

        <SummaryCard
          title="Total credits"
          icon={ArrowDownLeft}
          values={creditsByCurrency}
          tone="emerald"
        />

        <SummaryCard
          title="Total debits"
          icon={ArrowUpRight}
          values={debitsByCurrency}
          tone="rose"
        />
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-950 dark:text-white">
              Transaction history
            </h2>

            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              Search, filter and review your account activity.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Filter className="size-3.5" />
            {total.toLocaleString()} matching records
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-5">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              navigate();
            }}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search reference, description or plan..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-sky-600 focus:ring-2 focus:ring-sky-600/10 dark:border-white/10 dark:bg-slate-950 dark:text-white dark:focus:border-sky-400"
              />
            </div>

            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-sky-800 px-5 text-sm font-semibold text-white transition hover:bg-sky-900 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
            >
              <Search className="size-4" />
              Search
            </button>
          </form>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Transaction type
              </label>

              <select
                value={type}
                onChange={(event) => {
                  const value = event.target.value as TransactionType | "all";
                  setType(value);
                  navigate({ type: value });
                }}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none focus:border-sky-600 dark:border-white/10 dark:bg-slate-950 dark:text-white"
              >
                {transactionTypes.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Status
              </label>

              <select
                value={status}
                onChange={(event) => {
                  const value = event.target.value;
                  setStatus(value);
                  navigate({ status: value });
                }}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none focus:border-sky-600 dark:border-white/10 dark:bg-slate-950 dark:text-white"
              >
                <option value="all">All statuses</option>

                {statuses.map((item) => (
                  <option key={item} value={item}>
                    {formatEnumLabel(item)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Date range
              </label>

              <select
                value={dateRange}
                onChange={(event) => {
                  const value = event.target.value as TransactionDateRange;
                  setDateRange(value);
                  navigate({ dateRange: value });
                }}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none focus:border-sky-600 dark:border-white/10 dark:bg-slate-950 dark:text-white"
              >
                {dateRanges.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Sort by
              </label>

              <select
                value={sort}
                onChange={(event) => {
                  const value = event.target.value as "newest" | "oldest";
                  setSort(value);
                  navigate({ sort: value });
                }}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none focus:border-sky-600 dark:border-white/10 dark:bg-slate-950 dark:text-white"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
          </div>

          {dateRange === "custom" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Start date
                </label>

                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none focus:border-sky-600 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  End date
                </label>

                <input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none focus:border-sky-600 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="button"
                  disabled={!startDate && !endDate}
                  onClick={() =>
                    navigate({ dateRange: "custom", startDate, endDate })
                  }
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-sky-800 px-4 text-xs font-semibold text-white transition hover:bg-sky-900 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-sky-500 dark:text-slate-950"
                >
                  Apply date range
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/70 pt-3 dark:border-white/10">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>Rows per page</span>

              <select
                value={selectedPageSize}
                onChange={(event) => {
                  const value = event.target.value;
                  setSelectedPageSize(value);
                  navigate({ pageSize: Number(value) });
                }}
                className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-950 outline-none dark:border-white/10 dark:bg-slate-950 dark:text-white"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>

            <button
              type="button"
              onClick={resetFilters}
              disabled={!hasActiveFilters && selectedPageSize === "10"}
              className="inline-flex items-center gap-2 text-xs font-semibold text-sky-800 transition hover:text-sky-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-sky-300 dark:hover:text-sky-200"
            >
              <RotateCcw className="size-3.5" />
              Reset filters
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center px-5 py-14 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-white/[0.06] dark:text-slate-400">
                <ReceiptText className="size-6" />
              </div>

              <h3 className="mt-4 text-base font-semibold text-slate-950 dark:text-white">
                No transactions found
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-400">
                No transactions match your current search and filter settings.
                Try adjusting your filters or search terms.
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 text-sm font-semibold text-sky-800 transition hover:text-sky-900 dark:text-sky-300 dark:hover:text-sky-200"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-200/80 dark:divide-white/10">
              {transactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                />
              ))}
            </div>
          )}
        </div>

        {total > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing{" "}
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {((page - 1) * pageSize + 1).toLocaleString()}–
                {Math.min(page * pageSize, total).toLocaleString()}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {total.toLocaleString()}
              </span>{" "}
              transactions
            </p>

            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Page {page} of {totalPages}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => navigate({ page: page - 1 }, false)}
                  className="inline-flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.08]"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="size-4" />
                </button>

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => navigate({ page: page + 1 }, false)}
                  className="inline-flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.08]"
                  aria-label="Next page"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
