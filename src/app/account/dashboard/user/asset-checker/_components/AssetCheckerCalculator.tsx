"use client";

import { Loader2 } from "lucide-react";
import { type FormEvent, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type MarketAsset = {
  id: string;
  investmentName: string;
  planName: string;
  symbol: string;
};

type AssetCheckerCalculatorProps = {
  assets: MarketAsset[];
  initialAssetId: string;
  initialAmount: number;
  initialDays: number;
};

function resolveInitialAssetId(assets: MarketAsset[], assetId: string) {
  return assets.some((asset) => asset.id === assetId)
    ? assetId
    : assets[0]?.id ?? "";
}

export function AssetCheckerCalculator({
  assets,
  initialAssetId,
  initialAmount,
  initialDays,
}: AssetCheckerCalculatorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [selectedAssetId, setSelectedAssetId] = useState(() =>
    resolveInitialAssetId(assets, initialAssetId),
  );
  const [amount, setAmount] = useState(String(initialAmount));
  const [days, setDays] = useState(String(initialDays));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextAssetId = resolveInitialAssetId(assets, selectedAssetId);
    const params = new URLSearchParams();

    if (nextAssetId) {
      params.set("asset", nextAssetId);
    }

    const normalizedAmount = Number(amount);
    const normalizedDays = Number(days);

    if (Number.isFinite(normalizedAmount) && normalizedAmount > 0) {
      params.set("amount", amount);
    }

    if (Number.isFinite(normalizedDays) && normalizedDays > 0) {
      params.set("days", days);
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <Card className="min-w-0 rounded-[1.75rem] border border-white/10 bg-white/5">
      <CardContent className="space-y-6 p-5 sm:p-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-white">
            <span className="h-4 w-4 rounded-full border border-white/20 bg-white/10" />
            Calculator inputs
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-400">
            Pick an active market asset, then enter the amount and holding
            period.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="asset" className="text-sm font-medium text-white">
                Market asset
              </label>
              <Select
                value={selectedAssetId}
                onValueChange={setSelectedAssetId}
              >
                <SelectTrigger className="input-premium h-11 w-full rounded-xl border-white/10 bg-white/[0.03] text-left text-sm text-slate-100 hover:bg-white/[0.05] focus-visible:ring-blue-400/30">
                  <SelectValue placeholder="Select a market asset" />
                </SelectTrigger>
                <SelectContent>
                  {assets.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.investmentName} - {asset.planName} ({asset.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="days" className="text-sm font-medium text-white">
                Days
              </label>
              <Input
                id="days"
                name="days"
                type="number"
                min={1}
                step={1}
                value={days}
                onChange={(event) => setDays(event.target.value)}
                className="input-premium h-11 rounded-xl"
                placeholder="30"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium text-white">
                Amount
              </label>
              <Input
                id="amount"
                name="amount"
                type="number"
                min={0}
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="input-premium h-11 rounded-xl"
                placeholder="1000"
              />
            </div>

            <Button
              type="submit"
              disabled={isPending || !selectedAssetId}
              className="h-11 w-full rounded-xl bg-white px-5 text-sm font-medium text-slate-950 hover:bg-slate-100 sm:w-auto"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                "Calculate"
              )}
            </Button>
          </div>
        </form>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-slate-400">
          Market calculations use a live price snapshot. If the price stays
          flat, the current value remains unchanged over the number of days you
          enter.
        </div>
      </CardContent>
    </Card>
  );
}
