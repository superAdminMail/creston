"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CheckoutPaymentMode } from "@/lib/types/payments/checkout.types";

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
        "rounded-[1.75rem] border border-slate-200/80 bg-white/88 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.94),rgba(5,11,31,0.98))]",
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
          className="rounded-2xl"
        >
          Full Payment
        </Button>

        <Button
          type="button"
          variant={value === "PARTIAL" ? "default" : "outline"}
          onClick={() => onChange("PARTIAL")}
          className="rounded-2xl"
        >
          Partial Payment
        </Button>
      </CardContent>
    </Card>
  );
}
