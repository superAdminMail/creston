"use client";

import { CheckCircle2, CreditCard, Layers3 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DASHBOARD_PAGE_PANEL_CLASS } from "../../../../../_components/dashboardSurfaces";

type Props = {
  mode: "FULL" | "PARTIAL" | null;
  onModeChange: (mode: "FULL" | "PARTIAL") => void;
  className?: string;
};

const paymentOptions = [
  {
    value: "FULL" as const,
    title: "Full payment",
    description: "Settle the entire outstanding balance in one payment.",
    icon: CreditCard,
  },
  {
    value: "PARTIAL" as const,
    title: "Partial payment",
    description: "Pay a portion now and complete the remaining balance later.",
    icon: Layers3,
  },
];

export default function OrderPaymentSelector({
  mode,
  onModeChange,
  className,
}: Props) {
  return (
    <Card className={cn(DASHBOARD_PAGE_PANEL_CLASS, "w-full", className)}>
      <CardHeader className="space-y-2 p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300">
            <CreditCard className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-slate-950 dark:text-white sm:text-lg">
              Payment preference
            </CardTitle>
            <CardDescription className="mt-1 text-sm leading-5 text-slate-600 dark:text-slate-400">
              Choose how you would like to fund this investment.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid gap-3 px-4 pb-4 sm:grid-cols-2 sm:px-6 sm:pb-6">
        {paymentOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = mode === option.value;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onModeChange(option.value)}
              className={cn(
                "relative flex min-h-[132px] flex-col rounded-2xl border p-4 text-left transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950",
                isSelected
                  ? "border-sky-500 bg-sky-50 shadow-[0_8px_24px_rgba(14,116,208,0.10)] dark:border-sky-400 dark:bg-sky-400/[0.10]"
                  : "border-slate-200 bg-white hover:border-sky-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.025] dark:hover:border-sky-400/50 dark:hover:bg-white/[0.05]",
              )}
            >
              <div className="flex w-full items-start justify-between gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                    isSelected
                      ? "bg-sky-600 text-white dark:bg-sky-400 dark:text-slate-950"
                      : "bg-slate-100 text-slate-600 dark:bg-white/[0.07] dark:text-slate-300",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border transition-colors",
                    isSelected
                      ? "border-sky-600 bg-sky-600 text-white dark:border-sky-400 dark:bg-sky-400 dark:text-slate-950"
                      : "border-slate-300 text-transparent dark:border-slate-600",
                  )}
                >
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-4">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    isSelected
                      ? "text-sky-900 dark:text-sky-200"
                      : "text-slate-900 dark:text-white",
                  )}
                >
                  {option.title}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
                  {option.description}
                </p>
              </div>

              {isSelected ? (
                <span className="absolute bottom-3 right-4 text-[10px] font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-300">
                  Selected
                </span>
              ) : null}
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
