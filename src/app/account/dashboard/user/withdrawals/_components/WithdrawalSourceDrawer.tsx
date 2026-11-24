"use client";

import {
  CheckCircle2,
  PiggyBank,
  TrendingUp,
  Wallet,
  ArrowRight,
} from "lucide-react";

import {
  Drawer,
  DrawerClose,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { DrawerSurface } from "@/components/ui/drawer-surface";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters/formatters";
import { cn } from "@/lib/utils";
import { DASHBOARD_PAGE_SURFACE_CLASS } from "../../../_components/dashboardSurfaces";
import type { WithdrawalSourceOption } from "@/lib/service/getAvailableWithdrawalSource";
import type { WithdrawalSourceSelection } from "../_lib/withdrawal-types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalAvailableBalance: number;
  currency: string;
  savingsSource: WithdrawalSourceOption | null;
  investmentSource: WithdrawalSourceOption | null;
  selection: WithdrawalSourceSelection;
  isMixedSourceSelection: boolean;
  previewHasValidAmount: boolean;
  previewSavingsAmount: number;
  previewInvestmentAmount: number;
  onSelect: (selection: WithdrawalSourceSelection) => void;
};

export default function WithdrawalSourceDrawer({
  open,
  onOpenChange,
  totalAvailableBalance,
  currency,
  savingsSource,
  investmentSource,
  selection,
  isMixedSourceSelection,
  previewHasValidAmount,
  previewSavingsAmount,
  previewInvestmentAmount,
  onSelect,
}: Props) {
  const sources = [
    {
      key: "SAVINGS_POOL" as const,
      source: savingsSource,
      label: "Savings",
      description: "Withdraw from your available savings balance.",
      icon: PiggyBank,
    },
    {
      key: "INVESTMENT_POOL" as const,
      source: investmentSource,
      label: "Investment",
      description: "Withdraw from your available investment balance.",
      icon: TrendingUp,
    },
  ];

  const isAutoSelected = selection.allocationMode === "AUTO";
  const canUseAutoAllocation =
    Boolean(savingsSource && savingsSource.amount > 0) ||
    Boolean(investmentSource && investmentSource.amount > 0);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerSurface
        tone="light"
        className={cn(
          "z-[90] flex flex-col overflow-hidden border-border/70 bg-white text-slate-950 shadow-[0_32px_90px_rgba(15,23,42,0.24)]",
          "data-[vaul-drawer-direction=bottom]:h-[84dvh]",
          "data-[vaul-drawer-direction=bottom]:max-h-[84dvh]",
          "data-[vaul-drawer-direction=bottom]:rounded-t-[1.75rem]",
          "dark:border-white/10 dark:bg-slate-950 dark:text-white dark:shadow-[0_32px_90px_rgba(15,23,42,0.44)]",
        )}
      >
        <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col overflow-hidden">
          <DrawerHeader className="shrink-0 border-b border-border/60 px-4 pb-5 pt-5 text-left md:px-6">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-800 dark:bg-sky-400/10 dark:text-sky-300">
              <Wallet className="h-5 w-5" />
            </div>
            <DrawerTitle className="text-left text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
              Withdrawal source
            </DrawerTitle>
            <DrawerDescription className="mt-1 max-w-xl text-left text-sm leading-6 text-slate-600 dark:text-slate-400">
              Choose where the funds for this withdrawal should come from.
            </DrawerDescription>
          </DrawerHeader>

          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-4 py-5 [-webkit-overflow-scrolling:touch] md:px-6">
            <section className={cn(DASHBOARD_PAGE_SURFACE_CLASS, "p-4 sm:p-5")}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    Total available balance
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                    {formatCurrency(totalAvailableBalance, currency)}
                  </p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
                  Select an allocation method
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  You can choose a single source or let the system allocate the
                  withdrawal.
                </p>
              </div>

              <button
                type="button"
                disabled={!canUseAutoAllocation}
                onClick={() =>
                  onSelect({
                    allocationMode: "AUTO",
                    sourceType: null,
                    sourceId: null,
                  })
                }
                className={cn(
                  "flex w-full items-start justify-between gap-4 rounded-2xl border p-4 text-left transition",
                  isAutoSelected
                    ? "border-sky-300 bg-sky-50/80 ring-1 ring-sky-200 dark:border-sky-400/30 dark:bg-sky-400/10 dark:ring-0"
                    : "border-border/70 bg-white hover:border-sky-200 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]",
                  !canUseAutoAllocation && "cursor-not-allowed opacity-50",
                )}
              >
                <div className="flex min-w-0 gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-800 dark:bg-sky-400/10 dark:text-sky-300">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">
                      Automatic allocation
                    </p>
                    <p className="text-xs leading-5 text-slate-600 dark:text-slate-400">
                      Let the system distribute the amount across your eligible
                      balances.
                    </p>
                    {isMixedSourceSelection ? (
                      <p className="pt-1 text-xs font-medium text-sky-800 dark:text-sky-300">
                        Your current withdrawal uses both sources.
                      </p>
                    ) : null}
                  </div>
                </div>
                {isAutoSelected ? (
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-sky-700 dark:text-sky-300" />
                ) : (
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
                )}
              </button>
            </section>

            <section className="space-y-3">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
                  Individual sources
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Select one source if you prefer not to use automatic
                  allocation.
                </p>
              </div>

              {sources.map(
                ({ key, source, label, description, icon: Icon }) => {
                  const isSelected =
                    selection.allocationMode === "SINGLE"
                      ? selection.sourceType === key
                      : isMixedSourceSelection
                        ? (key === "SAVINGS_POOL" &&
                            previewSavingsAmount > 0) ||
                          (key === "INVESTMENT_POOL" &&
                            previewInvestmentAmount > 0)
                        : false;

                  const isDisabled =
                    !source ||
                    source.amount <= 0 ||
                    (previewHasValidAmount && isMixedSourceSelection);

                  const previewAmount =
                    key === "SAVINGS_POOL"
                      ? previewSavingsAmount
                      : previewInvestmentAmount;

                  return (
                    <button
                      type="button"
                      key={key}
                      disabled={isDisabled}
                      onClick={() => {
                        if (
                          !source ||
                          source.amount <= 0 ||
                          isMixedSourceSelection
                        ) {
                          return;
                        }

                        onSelect({
                          allocationMode: "SINGLE",
                          sourceType: source.type,
                          sourceId: source.id,
                        });
                      }}
                      className={cn(
                        "flex w-full items-center justify-between gap-4 rounded-2xl border p-4 text-left transition",
                        isSelected
                          ? "border-sky-300 bg-sky-50/80 ring-1 ring-sky-200 dark:border-sky-400/30 dark:bg-sky-400/10 dark:ring-0"
                          : "border-border/70 bg-white hover:border-sky-200 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]",
                        isDisabled && "cursor-not-allowed opacity-50",
                      )}
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-white/[0.07] dark:text-slate-200">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 space-y-1">
                          <p className="text-sm font-semibold text-slate-950 dark:text-white">
                            {label}
                          </p>
                          <p className="text-xs leading-5 text-slate-600 dark:text-slate-400">
                            {description}
                          </p>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            {source
                              ? formatCurrency(source.amount, source.currency)
                              : formatCurrency(0, currency)}
                          </p>
                          {isSelected && previewHasValidAmount ? (
                            <p className="text-xs font-medium text-sky-800 dark:text-sky-300">
                              Withdrawal allocation:{" "}
                              {formatCurrency(previewAmount, currency)}
                            </p>
                          ) : null}
                        </div>
                      </div>
                      {isSelected ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-sky-700 dark:text-sky-300" />
                      ) : (
                        <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                      )}
                    </button>
                  );
                },
              )}
            </section>

            {previewHasValidAmount && isMixedSourceSelection ? (
              <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-400/20 dark:bg-sky-400/10">
                <p className="text-sm font-medium text-sky-900 dark:text-sky-100">
                  Both sources are required
                </p>
                <p className="mt-1 text-xs leading-5 text-sky-800 dark:text-sky-200">
                  Your requested amount exceeds the available balance in either
                  individual source. Automatic allocation uses both eligible
                  balances to complete the withdrawal.
                </p>
                <div className="mt-3 space-y-2 border-t border-sky-200/70 pt-3 text-sm dark:border-sky-400/20">
                  <div className="flex justify-between gap-3">
                    <span className="text-sky-800 dark:text-sky-200">
                      Savings
                    </span>
                    <span className="font-medium text-sky-950 dark:text-white">
                      {formatCurrency(previewSavingsAmount, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-sky-800 dark:text-sky-200">
                      Investment
                    </span>
                    <span className="font-medium text-sky-950 dark:text-white">
                      {formatCurrency(previewInvestmentAmount, currency)}
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <DrawerFooter className="shrink-0 border-t border-border/60 bg-white px-4 py-4 dark:border-white/10 dark:bg-slate-950 md:px-6">
            <DrawerClose asChild>
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl border-border/70 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100 dark:hover:bg-white/[0.08]"
              >
                Done
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerSurface>
    </Drawer>
  );
}
