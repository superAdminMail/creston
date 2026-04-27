"use client";

import { useMemo, useState, type ComponentType } from "react";
import {
  BarChart3,
  CircleDollarSign,
  Landmark,
  LineChart,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from "lucide-react";

import type { AssetCheckerData } from "@/lib/services/asset-checker/getAssetCheckerData";
import { formatCurrency } from "@/lib/formatters/formatters";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type AssetCheckerProps = {
  data: AssetCheckerData;
};

type MarketAsset = AssetCheckerData["marketAssets"][number];
type FixedPlan = AssetCheckerData["fixedPlans"][number];

function parseAmount(value: string) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

function statCard({
  title,
  value,
  hint,
  icon: Icon,
  tone = "neutral",
}: {
  title: string;
  value: string;
  hint: string;
  icon: ComponentType<{ className?: string }>;
  tone?: "neutral" | "blue" | "emerald" | "amber";
}) {
  const toneClasses = {
    neutral: "border-white/10 bg-white/[0.04] text-white",
    blue: "border-blue-400/15 bg-blue-400/8 text-white",
    emerald: "border-emerald-400/15 bg-emerald-400/8 text-white",
    amber: "border-amber-400/15 bg-amber-400/8 text-white",
  } as const;

  return (
    <Card className="rounded-[1.75rem] border border-white/10 bg-white/5">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm text-slate-400">{title}</p>
            <h3 className="text-2xl font-semibold text-white">{value}</h3>
            <p className="text-xs leading-6 text-slate-500">{hint}</p>
          </div>

          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-2xl border",
              toneClasses[tone],
            )}
          >
            <Icon className="h-5 w-5 text-[#8fd0ff]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OptionHeader({
  title,
  subtitle,
  icon: Icon,
}: {
  title: string;
  subtitle: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
        <Icon className="h-5 w-5 text-[#8fd0ff]" />
      </div>
      <div>
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
}

function MarketAssetChecker({ assets }: { assets: MarketAsset[] }) {
  const [selectedAssetId, setSelectedAssetId] = useState(assets[0]?.id ?? "");
  const [capitalAmount, setCapitalAmount] = useState("1000");

  const selectedAsset = useMemo(
    () => assets.find((asset) => asset.id === selectedAssetId) ?? assets[0] ?? null,
    [assets, selectedAssetId],
  );

  const amountValue = parseAmount(capitalAmount);
  const estimatedCurrentValue = amountValue;

  if (!assets.length) {
    return (
      <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-white/[0.02] p-8 text-center sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04]">
          <Landmark className="h-6 w-6 text-[#8fd0ff]" />
        </div>
        <h3 className="mt-5 text-lg font-semibold text-white">
          No market assets available
        </h3>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">
          Only active platform market investments with live symbols appear in
          this checker.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <Card className="rounded-[1.75rem] border border-white/10 bg-white/5">
        <CardContent className="space-y-6 p-6">
          <div className="space-y-2">
            <OptionHeader
              title="Market asset selector"
              subtitle="Pick a platform-supported market asset and preview its live quote."
              icon={LineChart}
            />
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-white">Market asset</p>
              <Select
                value={selectedAsset?.id ?? ""}
                onValueChange={setSelectedAssetId}
              >
                <SelectTrigger className="input-premium h-11 w-full rounded-xl border-white/10 bg-white/[0.03] text-left text-slate-100 hover:bg-white/[0.05] focus-visible:ring-blue-400/30">
                  <SelectValue placeholder="Select a market asset" />
                </SelectTrigger>
                <SelectContent>
                  {assets.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.investmentName} | {asset.planName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-white">Capital amount</p>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={capitalAmount}
                onChange={(event) => setCapitalAmount(event.target.value)}
                className="input-premium h-11 rounded-xl"
                placeholder="Enter capital amount"
              />
            </div>
          </div>

          {selectedAsset ? (
            <div className="flex flex-wrap gap-2 text-xs text-slate-400">
              <span className="inline-flex items-center rounded-full border border-blue-400/15 bg-blue-400/8 px-3 py-1 text-blue-200">
                {selectedAsset.investmentName}
              </span>
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
                {selectedAsset.planName}
              </span>
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
                {selectedAsset.symbol}
              </span>
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
                {selectedAsset.priceSourceLabel}
              </span>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="rounded-[1.75rem] border border-blue-400/15 bg-[linear-gradient(135deg,rgba(10,31,68,0.86),rgba(7,18,38,0.98))]">
        <CardContent className="relative space-y-6 p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.08),transparent_30%)]" />

          <div className="relative space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs font-medium text-blue-200">
              <TrendingUp className="h-3.5 w-3.5" />
              Live market preview
            </div>

            <div className="space-y-1">
              <p className="text-sm text-slate-300">Selected asset</p>
              <h3 className="text-2xl font-semibold tracking-[-0.03em] text-white">
                {selectedAsset?.investmentName ?? "No asset selected"}
              </h3>
              <p className="text-sm text-slate-400">
                {selectedAsset
                  ? `${selectedAsset.planName} • ${selectedAsset.symbol}`
                  : "Choose an asset to see the current quote and a capital preview."}
              </p>
            </div>
          </div>

          <div className="relative grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                Current market price
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {selectedAsset?.currentPriceLabel ?? "Unavailable"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {selectedAsset?.priceRecordedAtLabel
                  ? `${selectedAsset.priceSourceLabel} • ${selectedAsset.priceRecordedAtLabel}`
                  : selectedAsset?.priceSourceLabel ?? "Market quote unavailable"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                Capital amount
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {formatCurrency(amountValue, "USD")}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Entered capital in USD for the selected market asset.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                Estimated current value
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {formatCurrency(estimatedCurrentValue, "USD")}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Values move with market prices; raw units remain hidden.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                Asset type
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {selectedAsset?.investmentTypeLabel ?? "Not selected"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Platform-supported asset only.
              </p>
            </div>
          </div>

          <div className="relative rounded-2xl border border-blue-400/15 bg-blue-400/8 px-4 py-4">
            <p className="text-sm font-medium text-blue-100">
              This is a live price checker, not a guaranteed performance
              projection.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FixedReturnCalculator({ plans }: { plans: FixedPlan[] }) {
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id ?? "");
  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId) ?? plans[0] ?? null,
    [plans, selectedPlanId],
  );
  const [selectedTierId, setSelectedTierId] = useState(
    selectedPlan?.tiers[0]?.id ?? "",
  );
  const [capitalAmount, setCapitalAmount] = useState("1000");

  const selectedTier = useMemo(() => {
    if (!selectedPlan) return null;
    return (
      selectedPlan.tiers.find((tier) => tier.id === selectedTierId) ??
      selectedPlan.tiers[0] ??
      null
    );
  }, [selectedPlan, selectedTierId]);

  const amountValue = parseAmount(capitalAmount);
  const roiPercent = selectedTier?.fixedRoiPercent ?? 0;
  const expectedProfit = (amountValue * roiPercent) / 100;
  const maturityValue = amountValue + expectedProfit;
  const dailyAccrual =
    selectedPlan && selectedPlan.durationDays > 0
      ? expectedProfit / selectedPlan.durationDays
      : 0;

  if (!plans.length) {
    return (
      <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-white/[0.02] p-8 text-center sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04]">
          <ShieldCheck className="h-6 w-6 text-[#8fd0ff]" />
        </div>
        <h3 className="mt-5 text-lg font-semibold text-white">
          No fixed bond plans available
        </h3>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">
          Only active fixed investment plans with active tiers appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <Card className="rounded-[1.75rem] border border-white/10 bg-white/5">
        <CardContent className="space-y-6 p-6">
          <OptionHeader
            title="Fixed bond selector"
            subtitle="Pick a fixed plan and tier to estimate simple-interest returns."
            icon={ShieldCheck}
          />

          <div className="grid gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-white">Fixed plan</p>
              <Select
                value={selectedPlan?.id ?? ""}
                onValueChange={(value) => {
                  setSelectedPlanId(value);
                  const nextPlan = plans.find((plan) => plan.id === value);
                  setSelectedTierId(nextPlan?.tiers[0]?.id ?? "");
                }}
              >
                <SelectTrigger className="input-premium h-11 w-full rounded-xl border-white/10 bg-white/[0.03] text-left text-slate-100 hover:bg-white/[0.05] focus-visible:ring-blue-400/30">
                  <SelectValue placeholder="Select a fixed plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.investmentName} | {plan.planName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-white">Plan tier</p>
              <Select
                value={selectedTier?.id ?? ""}
                onValueChange={setSelectedTierId}
                disabled={!selectedPlan}
              >
                <SelectTrigger className="input-premium h-11 w-full rounded-xl border-white/10 bg-white/[0.03] text-left text-slate-100 hover:bg-white/[0.05] focus-visible:ring-blue-400/30">
                  <SelectValue placeholder="Select a tier" />
                </SelectTrigger>
                <SelectContent>
                  {selectedPlan?.tiers.map((tier) => (
                    <SelectItem key={tier.id} value={tier.id}>
                      {tier.levelLabel} | {tier.fixedRoiLabel ?? "ROI not set"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-white">Capital amount</p>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={capitalAmount}
                onChange={(event) => setCapitalAmount(event.target.value)}
                className="input-premium h-11 rounded-xl"
                placeholder="Enter capital amount"
              />
            </div>
          </div>

          {selectedPlan ? (
            <div className="flex flex-wrap gap-2 text-xs text-slate-400">
              <span className="inline-flex items-center rounded-full border border-blue-400/15 bg-blue-400/8 px-3 py-1 text-blue-200">
                {selectedPlan.investmentName}
              </span>
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
                {selectedPlan.planName}
              </span>
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
                {selectedTier?.levelLabel ?? "Tier not selected"}
              </span>
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
                {selectedPlan.periodLabel}
              </span>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="rounded-[1.75rem] border border-blue-400/15 bg-[linear-gradient(135deg,rgba(10,31,68,0.86),rgba(7,18,38,0.98))]">
        <CardContent className="relative space-y-6 p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.08),transparent_30%)]" />

          <div className="relative space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs font-medium text-blue-200">
              <CircleDollarSign className="h-3.5 w-3.5" />
              Fixed return preview
            </div>

            <div className="space-y-1">
              <p className="text-sm text-slate-300">Selected plan</p>
              <h3 className="text-2xl font-semibold tracking-[-0.03em] text-white">
                {selectedPlan?.planName ?? "No plan selected"}
              </h3>
              <p className="text-sm text-slate-400">
                {selectedPlan
                  ? `${selectedPlan.investmentName} • ${selectedTier?.levelLabel ?? "Select a tier"}`
                  : "Choose a fixed bond plan and tier to see the return estimate."}
              </p>
            </div>
          </div>

          <div className="relative grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                Fixed ROI
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {selectedTier?.fixedRoiLabel ?? "Unavailable"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Tier-specific deterministic ROI.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                Duration
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {selectedPlan?.durationLabel ?? "Unavailable"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Profit accrues across the selected bond window.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                Expected profit
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {formatCurrency(expectedProfit, selectedPlan?.currency ?? "USD")}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Calculated as capital × fixed ROI.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                Maturity value
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {formatCurrency(maturityValue, selectedPlan?.currency ?? "USD")}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Principal plus locked return.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                Daily accrual estimate
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {formatCurrency(dailyAccrual, selectedPlan?.currency ?? "USD")}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Simple-interest estimate per day.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                Capital amount
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {formatCurrency(amountValue, selectedPlan?.currency ?? "USD")}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Amount entered for the selected bond.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function AssetChecker({ data }: AssetCheckerProps) {
  return (
    <Tabs defaultValue="market" className="space-y-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/15 bg-blue-400/8 px-3 py-1 text-xs font-medium text-blue-200">
            <span className="h-2 w-2 rounded-full bg-blue-400" />
            Asset intelligence
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
              Asset checker
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              Review only platform-supported market assets and fixed bond
              plans before comparing live price previews or locked return
              estimates.
            </p>
          </div>
        </div>

        <TabsList className="grid w-full grid-cols-2 gap-2 rounded-2xl border border-white/8 bg-white/[0.03] p-1 text-slate-400 sm:inline-flex sm:w-auto sm:grid-cols-none sm:flex-row sm:items-center">
          <TabsTrigger
            value="market"
            className="h-10 w-full justify-center rounded-xl border border-transparent px-3 text-xs font-medium text-slate-400 transition-all duration-200 hover:text-white data-active:border-white/10 data-active:bg-[#0d1a2c] data-active:text-white sm:h-11 sm:w-[172px] sm:justify-start sm:px-4 sm:text-sm"
          >
            <div className="flex items-center gap-2.5">
              <LineChart className="h-4.5 w-4.5 text-[#8fd0ff]" />
              <span>Market</span>
            </div>
          </TabsTrigger>

          <TabsTrigger
            value="fixed"
            className="h-10 w-full justify-center rounded-xl border border-transparent px-3 text-xs font-medium text-slate-400 transition-all duration-200 hover:text-white data-active:border-white/10 data-active:bg-[#0d1a2c] data-active:text-white sm:h-11 sm:w-[172px] sm:justify-start sm:px-4 sm:text-sm"
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-300" />
              <span>Fixed bond</span>
            </div>
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCard({
          title: "Market assets",
          value: String(data.stats.marketAssetsCount),
          hint: "Active market plans backed by a platform investment symbol",
          icon: LineChart,
          tone: "blue",
        })}
        {statCard({
          title: "Fixed plans",
          value: String(data.stats.fixedPlansCount),
          hint: "Active fixed bond plans with selectable tiers",
          icon: ShieldCheck,
          tone: "emerald",
        })}
        {statCard({
          title: "Live quotes",
          value: String(data.stats.liveQuotesCount),
          hint: "Market assets with a resolved current price",
          icon: Wallet,
          tone: "amber",
        })}
        {statCard({
          title: "Active tiers",
          value: String(data.stats.fixedTiersCount),
          hint: "Fixed return ranges available for simulation",
          icon: BarChart3,
          tone: "neutral",
        })}
      </div>

      <TabsContent value="market" className="mt-0">
        <MarketAssetChecker assets={data.marketAssets} />
      </TabsContent>

      <TabsContent value="fixed" className="mt-0">
        <FixedReturnCalculator plans={data.fixedPlans} />
      </TabsContent>
    </Tabs>
  );
}
