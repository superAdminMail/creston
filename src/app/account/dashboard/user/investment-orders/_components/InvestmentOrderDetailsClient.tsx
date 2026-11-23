"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Landmark,
  Layers3,
  ShieldCheck,
  TrendingUp,
  Wallet,
  AlertCircle,
  RefreshCw,
  Dot,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CancelPendingInvestmentOrderButton } from "@/components/account/CancelPendingInvestmentOrderButton";
import { formatCurrency } from "@/lib/formatters/formatters";
import { formatEnumLabel } from "@/lib/formatters/formatters";
import { formatInvestmentOrderRuntimeStatusLabel } from "@/lib/investment/formatInvestmentOrderRuntimeStatusLabel";
import { isInactiveInvestmentOrderRuntimeStatus } from "@/lib/investment/formatInvestmentOrderRuntimeStatusLabel";

type InvestmentOrderDetailsClientProps = {
  order: {
    id: string;
    amount: number;
    amountPaid: number;
    expectedReturn: number;
    earnedProfit: number;
    remainingAmount: number;
    currency: string;
    investmentModel: string;
    status: string;
    runtimeStatus: string;
    isMatured: boolean;
    paymentMethodLabel: string;
    paymentReference: string | null;
    startDate: string | null;
    maturityDate: string | null;
    paidAt: string | null;
    confirmedAt: string | null;
    createdAt: string;
    investmentPlan: {
      name: string;
      durationDays: number;
      investmentModel: string;
      investment: {
        name: string;
        type: string;
        symbol: string | null;
      };
    };
    investmentPlanTier: {
      level: string;
    };
    returnLabel: string | null;
    capitalUpdateReason: string | null;
    hasUpgradeOffer: boolean;
    hasCapitalUpdateOffer: boolean;
    isUpgraded: boolean;
    isCapitalUpdated: boolean;
    canMakePayment: boolean;
    canUpgrade: boolean;
    canUpdateCapital: boolean;
  };
  isInactive: boolean;
  upgradePath: string;
  capitalUpdatePath: string;
};

function formatDate(value: string | null, fallback: string) {
  if (!value) return fallback;

  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function DetailItem({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-slate-50 text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 break-words text-sm font-medium text-slate-900 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

function FinancialMetric({
  label,
  value,
  description,
  icon: Icon,
  featured = false,
}: {
  label: string;
  value: string;
  description?: string;
  icon: React.ElementType;
  featured?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm ${
        featured
          ? "border-blue-200/70 bg-blue-50/80 dark:border-blue-400/20 dark:bg-blue-500/[0.08]"
          : "border-border/60 bg-white/75 dark:border-white/10 dark:bg-white/[0.035]"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>

      <p className="mt-3 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
        {value}
      </p>

      {description ? (
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

export default function InvestmentOrderDetailsClient({
  order,
  isInactive,
  upgradePath,
  capitalUpdatePath,
}: InvestmentOrderDetailsClientProps) {
  const paymentProgress =
    order.amount > 0
      ? Math.min((order.amountPaid / order.amount) * 100, 100)
      : 0;

  const paymentComplete = order.remainingAmount <= 0;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-col gap-5">
        <Link
          href="/account/dashboard/user/investment-orders"
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to investment orders
        </Link>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="rounded-full border-blue-200 bg-blue-50 px-3 py-1 text-blue-700 dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-200"
              >
                Investment order
              </Badge>

              {order.isMatured ? (
                <Badge className="rounded-full border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:bg-emerald-500/10">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Matured
                </Badge>
              ) : null}

              {order.isUpgraded ? (
                <Badge className="rounded-full border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:bg-emerald-500/10">
                  Upgraded
                </Badge>
              ) : null}

              {order.isCapitalUpdated ? (
                <Badge className="rounded-full border-sky-200 bg-sky-50 px-3 py-1 text-sky-700 hover:bg-sky-50 dark:border-sky-400/20 dark:bg-sky-500/10 dark:text-sky-200 dark:hover:bg-sky-500/10">
                  Capital updated
                </Badge>
              ) : null}
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                {order.investmentPlan.investment.name}
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                {order.investmentPlan.name}
                {order.investmentPlan.investment.symbol
                  ? ` · ${order.investmentPlan.investment.symbol}`
                  : ""}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="rounded-full border-slate-300 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                {formatEnumLabel(order.status)}
              </Badge>

              <Dot className="text-muted-foreground" />

              <Badge
                variant="outline"
                className="rounded-full border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200"
              >
                {formatInvestmentOrderRuntimeStatusLabel(order.runtimeStatus)}
              </Badge>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto lg:flex-wrap lg:justify-end">
            {order.canMakePayment ? (
              <Button
                asChild
                className="rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-sm"
              >
                <Link
                  href={`/account/dashboard/user/investment-orders/${order.id}/payment`}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Make payment
                </Link>
              </Button>
            ) : null}

            {order.canUpgrade ? (
              <Button
                asChild
                className="rounded-xl bg-gradient-to-r from-emerald-700 to-green-500 text-white shadow-sm"
              >
                <Link href={upgradePath}>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Upgrade
                </Link>
              </Button>
            ) : null}

            {order.canUpdateCapital ? (
              <Button
                asChild
                className="rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 text-white shadow-sm"
              >
                <Link href={capitalUpdatePath}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Update capital
                </Link>
              </Button>
            ) : null}

            {order.status === "PENDING_PAYMENT" ? (
              <CancelPendingInvestmentOrderButton
                orderId={order.id}
                className="rounded-xl"
              />
            ) : null}
          </div>
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <FinancialMetric
          label="Invested capital"
          value={formatCurrency(order.amount, order.currency)}
          description="Total order amount"
          icon={Wallet}
          featured
        />

        <FinancialMetric
          label="Expected return"
          value={formatCurrency(order.expectedReturn, order.currency)}
          description={order.returnLabel ?? "Return not configured"}
          icon={TrendingUp}
        />

        <FinancialMetric
          label="Recognized earnings"
          value={formatCurrency(order.earnedProfit, order.currency)}
          description="Profit recorded for this order"
          icon={BadgeCheck}
        />

        <FinancialMetric
          label="Remaining payment"
          value={formatCurrency(order.remainingAmount, order.currency)}
          description={
            paymentComplete ? "Payment completed" : "Outstanding balance"
          }
          icon={CreditCard}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-border/60 bg-white/75 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.035] sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-950 dark:text-white">
                  Payment overview
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Track the payment progress for this investment order.
                </p>
              </div>

              <Badge variant="outline" className="w-fit rounded-full px-3 py-1">
                {paymentComplete ? "Fully paid" : "Payment in progress"}
              </Badge>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Payment progress
                </span>
                <span className="text-sm font-semibold tabular-nums text-slate-950 dark:text-white">
                  {paymentProgress.toFixed(0)}%
                </span>
              </div>

              <div
                className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10"
                role="progressbar"
                aria-label="Payment progress"
                aria-valuenow={Math.round(paymentProgress)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-sky-400 transition-all"
                  style={{ width: `${paymentProgress}%` }}
                />
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <DetailItem
                label="Order amount"
                value={formatCurrency(order.amount, order.currency)}
                icon={Wallet}
              />

              <DetailItem
                label="Amount paid"
                value={formatCurrency(order.amountPaid, order.currency)}
                icon={CheckCircle2}
              />

              <DetailItem
                label="Outstanding"
                value={formatCurrency(order.remainingAmount, order.currency)}
                icon={CreditCard}
              />
            </div>
          </section>

          <section className="rounded-3xl border border-border/60 bg-white/75 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.035] sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                <Layers3 className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-base font-semibold text-slate-950 dark:text-white">
                  Investment details
                </h2>
                <p className="text-sm text-muted-foreground">
                  Your selected investment configuration.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <DetailItem
                label="Investment"
                value={order.investmentPlan.investment.name}
                icon={TrendingUp}
              />

              <DetailItem
                label="Investment type"
                value={formatEnumLabel(order.investmentPlan.investment.type)}
                icon={Layers3}
              />

              <DetailItem
                label="Investment model"
                value={formatEnumLabel(order.investmentModel)}
                icon={Landmark}
              />

              <DetailItem
                label="Investment plan"
                value={order.investmentPlan.name}
                icon={ShieldCheck}
              />

              <DetailItem
                label="Plan tier"
                value={formatEnumLabel(order.investmentPlanTier.level)}
                icon={BadgeCheck}
              />

              <DetailItem
                label="Plan duration"
                value={`${order.investmentPlan.durationDays} days`}
                icon={CalendarDays}
              />

              <DetailItem
                label="Target return"
                value={order.returnLabel ?? "Not configured"}
                icon={TrendingUp}
              />

              <DetailItem
                label="Expected return"
                value={formatCurrency(order.expectedReturn, order.currency)}
                icon={Wallet}
              />
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl border border-border/60 bg-white/75 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.035] sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                <Clock3 className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-base font-semibold text-slate-950 dark:text-white">
                  Order lifecycle
                </h2>
                <p className="text-sm text-muted-foreground">
                  Important dates and milestones.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <DetailItem
                label="Order created"
                value={formatDate(order.createdAt, "Not available")}
                icon={CalendarDays}
              />

              <DetailItem
                label="Investment start"
                value={formatDate(order.startDate, "Not started")}
                icon={Clock3}
              />

              <DetailItem
                label="Maturity date"
                value={formatDate(order.maturityDate, "Not set")}
                icon={CalendarDays}
              />

              <DetailItem
                label="Payment recorded"
                value={formatDate(order.paidAt, "Not paid yet")}
                icon={CreditCard}
              />

              <DetailItem
                label="Order confirmed"
                value={formatDate(order.confirmedAt, "Awaiting confirmation")}
                icon={CheckCircle2}
              />
            </div>

            <div className="mt-5 rounded-2xl border border-blue-200/60 bg-blue-50/70 p-4 text-sm leading-6 text-blue-900 dark:border-blue-400/15 dark:bg-blue-500/[0.07] dark:text-blue-100">
              Your investment start and maturity dates are anchored when the
              order is confirmed.
            </div>
          </section>

          <section className="rounded-3xl border border-border/60 bg-white/75 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.035] sm:p-6">
            <h2 className="text-base font-semibold text-slate-950 dark:text-white">
              Payment information
            </h2>

            <div className="mt-5 space-y-5">
              <DetailItem
                label="Payment method"
                value={order.paymentMethodLabel}
                icon={Landmark}
              />

              <DetailItem
                label="Payment reference"
                value={order.paymentReference || "Not provided"}
                icon={CreditCard}
              />
            </div>
          </section>
        </div>
      </div>

      {isInactive ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200/70 bg-amber-50/80 p-4 text-amber-950 dark:border-amber-400/20 dark:bg-amber-500/[0.08] dark:text-amber-100">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

          <div>
            <p className="text-sm font-semibold">Investment order inactive</p>
            <p className="mt-1 text-sm leading-6">
              This investment order is currently inactive. Please contact
              support if you need it reactivated.
            </p>
          </div>
        </div>
      ) : null}

      {order.hasCapitalUpdateOffer ? (
        <div className="flex items-start gap-3 rounded-2xl border border-sky-200/70 bg-sky-50/80 p-4 text-sky-950 dark:border-sky-400/20 dark:bg-sky-500/[0.08] dark:text-sky-100">
          <RefreshCw className="mt-0.5 h-5 w-5 shrink-0" />

          <div>
            <p className="text-sm font-semibold">Capital update required</p>
            <p className="mt-1 text-sm leading-6">
              A capital update is required for this order.
              {order.capitalUpdateReason ? ` ${order.capitalUpdateReason}` : ""}
            </p>

            {order.canUpdateCapital ? (
              <Link
                href={capitalUpdatePath}
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold underline underline-offset-4"
              >
                Review capital update
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
