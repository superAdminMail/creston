"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CheckoutPaymentMode } from "@/lib/types/payments/checkout.types";
import { DASHBOARD_PAGE_PANEL_CLASS } from "../../_components/dashboardSurfaces";

type Props = {
  value: CheckoutPaymentMode | null;
  onChange: (value: CheckoutPaymentMode) => void;
  title?: string;
  description?: string;
  className?: string;
};

export default function CheckoutPaymentModeSelector({
  value,
  onChange,
  title = "Choose payment mode",
  description = "Pick whether to settle the full amount now or continue with a partial payment.",
  className,
}: Props) {
  return (
    <Card
      className={cn(
        DASHBOARD_PAGE_PANEL_CLASS,
        className,
      )}
    >
      <CardHeader className="space-y-2">
        <CardTitle className="text-lg text-slate-950 dark:text-white">
          {title}
        </CardTitle>
        <CardDescription className="text-sm leading-6 text-slate-600 dark:text-slate-400">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-3 md:grid-cols-2">
        <Button
          type="button"
          variant={value === "FULL" ? "default" : "outline"}
          onClick={() => onChange("FULL")}
          className="rounded-2xl border border-slate-200/80 bg-white/90 text-slate-700 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08]"
        >
          Full Payment
        </Button>

        <Button
          type="button"
          variant={value === "PARTIAL" ? "default" : "outline"}
          onClick={() => onChange("PARTIAL")}
          className="rounded-2xl border border-slate-200/80 bg-white/90 text-slate-700 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08]"
        >
          Partial Payment
        </Button>
      </CardContent>
    </Card>
  );
}
