export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft, Calculator, LineChart, TrendingUp } from "lucide-react";

import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { formatCurrency } from "@/lib/formatters/formatters";
import { getAssetCheckerData } from "@/lib/services/asset-checker/getAssetCheckerData";
import { Card, CardContent } from "@/components/ui/card";
import { redirect } from "next/navigation";
import {
  DASHBOARD_PAGE_PANEL_CLASS,
  DASHBOARD_PAGE_SURFACE_CLASS,
} from "../../_components/dashboardSurfaces";
import { AssetCheckerCalculator } from "./_components/AssetCheckerCalculator";

type SearchParams = Record<string, string | string[] | undefined>;

type PageProps = {
  searchParams?: Promise<SearchParams>;
};

type MarketAsset = Awaited<
  ReturnType<typeof getAssetCheckerData>
>["marketAssets"][number];

function resolveSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : (value ?? null);
}

function parsePositiveNumber(
  value: string | null,
  fallback: number,
  minimum = 1,
) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < minimum) {
    return fallback;
  }

  return parsed;
}

function formatUnits(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 8,
  }).format(value);
}

function calculateMarketEstimate(input: {
  amount: number;
  days: number;
  currentPrice: number | null | undefined;
}) {
  const amount =
    Number.isFinite(input.amount) && input.amount > 0 ? input.amount : 0;
  const days =
    Number.isFinite(input.days) && input.days > 0 ? Math.floor(input.days) : 1;
  const currentPrice =
    input.currentPrice !== null &&
    input.currentPrice !== undefined &&
    input.currentPrice > 0
      ? input.currentPrice
      : 0;

  const units = currentPrice > 0 ? amount / currentPrice : 0;
  const currentValue = units > 0 ? units * currentPrice : 0;

  return {
    amount,
    days,
    currentPrice,
    units,
    currentValue,
  };
}

function MarketSummaryCard({
  asset,
  amount,
  days,
}: {
  asset: MarketAsset | null;
  amount: number;
  days: number;
}) {
  const calculation = calculateMarketEstimate({
    amount,
    days,
    currentPrice: asset?.currentPrice,
  });

  return (
    <Card
      className={`${DASHBOARD_PAGE_SURFACE_CLASS} min-w-0 overflow-hidden rounded-[1.75rem]`}
    >
      <CardContent className="relative space-y-6 p-5 sm:p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.08),transparent_30%)]" />

        <div className="relative space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-700 shadow-[0_10px_24px_rgba(59,130,246,0.14)] dark:text-sky-200">
            <TrendingUp className="h-3.5 w-3.5" />
            Live market snapshot
          </div>

          <div className="space-y-1">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Selected asset
            </p>
            <h3 className="break-words text-xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-2xl dark:text-white">
              {asset?.investmentName ?? "No asset selected"}
            </h3>
            <p className="max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              {asset
                ? `${asset.planName} - ${asset.symbol}`
                : "Choose a market asset to see the live price-based estimate."}
            </p>
          </div>
        </div>

        <div className="relative grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-border/60 bg-white/75 px-4 py-3 shadow-sm dark:bg-white/[0.04]">
            <p className="text-xs uppercase tracking-[0.14em] text-sky-700/90 dark:text-sky-300/80">
              Current market price
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
              {asset?.currentPriceLabel ?? "Unavailable"}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
              {asset?.priceSourceLabel ?? "Market quote unavailable"}
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-white/75 px-4 py-3 shadow-sm dark:bg-white/[0.04]">
            <p className="text-xs uppercase tracking-[0.14em] text-sky-700/90 dark:text-sky-300/80">
              Amount entered
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
              {formatCurrency(calculation.amount, asset?.currency ?? "USD")}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
              Live calculator input used for the estimate.
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-white/75 px-4 py-3 shadow-sm dark:bg-white/[0.04]">
            <p className="text-xs uppercase tracking-[0.14em] text-sky-700/90 dark:text-sky-300/80">
              Estimated units
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
              {calculation.currentPrice > 0
                ? formatUnits(calculation.units)
                : "Unavailable"}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
              Based on the current market price snapshot.
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-white/75 px-4 py-3 shadow-sm dark:bg-white/[0.04]">
            <p className="text-xs uppercase tracking-[0.14em] text-sky-700/90 dark:text-sky-300/80">
              Holding period
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
              {calculation.days} {calculation.days === 1 ? "day" : "days"}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
              Market value uses the live price only.
            </p>
          </div>
        </div>

        <div className="relative rounded-2xl border border-border/60 bg-white/75 px-4 py-4 shadow-sm dark:bg-white/[0.04]">
          <p className="text-xs uppercase tracking-[0.14em] text-sky-700/90 dark:text-sky-300/80">
            Estimated USD value
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
            {formatCurrency(calculation.currentValue, "USD")}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
            This is the USD value of the calculated holdings at the current
            market price snapshot.
          </p>
        </div>

        <div className="relative rounded-2xl border border-sky-400/20 bg-sky-500/10 px-4 py-4 shadow-[0_12px_28px_rgba(59,130,246,0.14)]">
          <p className="text-sm font-medium leading-6 text-sky-700 dark:text-sky-200">
            If the market price stays flat, the current value remains{" "}
            {formatCurrency(calculation.currentValue, asset?.currency ?? "USD")}
            .
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function AssetCheckerPage({ searchParams }: PageProps) {
  const user = await getCurrentSessionUser();

  if (!user?.id) {
    redirect("/auth/login");
  }

  const params = searchParams ? await searchParams : undefined;
  const data = await getAssetCheckerData();
  const selectedAssetId = resolveSearchParam(params?.asset);
  const hasCalculation =
    Boolean(resolveSearchParam(params?.asset)) ||
    Boolean(resolveSearchParam(params?.amount)) ||
    Boolean(resolveSearchParam(params?.days));
  const selectedAsset =
    data.marketAssets.find((asset) => asset.id === selectedAssetId) ??
    data.marketAssets[0] ??
    null;
  const amount = parsePositiveNumber(
    resolveSearchParam(params?.amount),
    1000,
    0.01,
  );
  const days = parsePositiveNumber(resolveSearchParam(params?.days), 30, 1);

  return (
    <main className="mx-auto max-w-6xl space-y-8 ">
      <section
        className={`${DASHBOARD_PAGE_PANEL_CLASS} overflow-hidden p-5 sm:p-6 lg:p-8`}
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-4">
            <div className="flex justify-between">
              <Link
                href="/account/dashboard/user"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to dashboard
              </Link>

              <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-700 shadow-[0_10px_24px_rgba(59,130,246,0.14)] dark:text-sky-200">
                <Calculator className="h-3.5 w-3.5" />
                Market asset checker
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl dark:text-white">
                Asset checker
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base dark:text-slate-400">
                Use the current market price to estimate how many units your
                amount can buy over the holding period you enter.
              </p>
            </div>
          </div>

          <div className="inline-flex  w-full items-center justify-center gap-2 rounded-2xl border border-border/60 bg-white/75 px-4 py-3 text-sm text-slate-700 shadow-[0_12px_28px_rgba(59,130,246,0.14)] sm:w-auto sm:justify-start dark:bg-white/[0.04] dark:text-slate-200">
            <LineChart className="h-4 w-4 shrink-0 text-sky-700 dark:text-sky-300" />
            <span>Live price snapshot</span>
          </div>
        </div>
      </section>

      {data.marketAssets.length ? (
        <section
          className={`grid gap-6 ${
            hasCalculation
              ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
              : "lg:grid-cols-[minmax(0,1fr)]"
          }`}
        >
          <AssetCheckerCalculator
            key={`${selectedAsset?.id ?? "none"}:${amount}:${days}`}
            assets={data.marketAssets.map((asset) => ({
              id: asset.id,
              investmentName: asset.investmentName,
              planName: asset.planName,
              symbol: asset.symbol,
            }))}
            initialAssetId={selectedAsset?.id ?? data.marketAssets[0]?.id ?? ""}
            initialAmount={amount}
            initialDays={days}
          />

          {hasCalculation ? (
            <MarketSummaryCard
              asset={selectedAsset}
              amount={amount}
              days={days}
            />
          ) : (
            <Card
              className={`${DASHBOARD_PAGE_SURFACE_CLASS} min-w-0 rounded-[1.75rem] border-dashed`}
            >
              <CardContent className="flex min-h-[280px] flex-col items-center justify-center gap-3 p-6 text-center sm:p-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl border border-border/60 bg-white/75 shadow-sm dark:bg-white/[0.04]">
                  <LineChart className="h-6 w-6 text-sky-700 dark:text-sky-300" />
                </div>
                <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                  Run a calculation to see the result
                </h2>
                <p className="max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Enter an amount and holding period, then press Calculate to
                  reveal the market summary.
                </p>
              </CardContent>
            </Card>
          )}
        </section>
      ) : (
        <Card
          className={`${DASHBOARD_PAGE_SURFACE_CLASS} rounded-[1.75rem] border-dashed`}
        >
          <CardContent className="space-y-4 p-6 text-center sm:p-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl border border-border/60 bg-white/75 shadow-sm dark:bg-white/[0.04]">
              <Calculator className="h-6 w-6 text-sky-700 dark:text-sky-300" />
            </div>
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
              No market assets available
            </h2>
            <p className="mx-auto max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              Active market assets with live symbols are required before the
              checker can calculate a result.
            </p>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
