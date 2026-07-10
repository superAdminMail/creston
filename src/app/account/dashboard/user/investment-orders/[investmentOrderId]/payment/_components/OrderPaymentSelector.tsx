"use client";

import { Button } from "@/components/ui/button";
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

export default function OrderPaymentSelector({
  mode,
  onModeChange,
  className,
}: Props) {
  return (
    <Card
      className={cn(
        DASHBOARD_PAGE_PANEL_CLASS,
        className,
      )}
    >
      <CardHeader className="space-y-2 p-4 sm:p-6">
        <CardTitle className="text-base text-slate-950 sm:text-lg dark:text-white">
          Payment mode
        </CardTitle>
        <CardDescription className="text-sm leading-6 text-slate-600 sm:text-[15px] dark:text-slate-400">
          Choose whether to settle the full amount now or continue with a
          partial payment.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-3 px-4 pb-4 sm:grid-cols-2 sm:px-6 sm:pb-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => onModeChange("FULL")}
          className={
            mode === "FULL"
              ? "rounded-2xl border-sky-300/70 bg-sky-600 text-white shadow-sm hover:bg-sky-500 dark:border-sky-300/40 dark:bg-sky-500 dark:text-white dark:hover:bg-sky-400"
              : "rounded-2xl border border-slate-200/80 bg-white/95 text-slate-700 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-900/80"
          }
        >
          Full Payment
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => onModeChange("PARTIAL")}
          className={
            mode === "PARTIAL"
              ? "rounded-2xl border-sky-300/70 bg-sky-600 text-white shadow-sm hover:bg-sky-500 dark:border-sky-300/40 dark:bg-sky-500 dark:text-white dark:hover:bg-sky-400"
              : "rounded-2xl border border-slate-200/80 bg-white/95 text-slate-700 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-900/80"
          }
        >
          Partial Payment
        </Button>
      </CardContent>
    </Card>
  );
}
