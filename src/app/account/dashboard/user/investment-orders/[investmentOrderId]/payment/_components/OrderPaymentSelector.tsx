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
        "rounded-[1.75rem] border border-slate-200/80 bg-white/88 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.94),rgba(5,11,31,0.98))]",
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
          variant={mode === "FULL" ? "default" : "outline"}
          onClick={() => onModeChange("FULL")}
          className="rounded-2xl"
        >
          Full Payment
        </Button>

        <Button
          type="button"
          variant={mode === "PARTIAL" ? "default" : "outline"}
          onClick={() => onModeChange("PARTIAL")}
          className="rounded-2xl"
        >
          Partial Payment
        </Button>
      </CardContent>
    </Card>
  );
}
