"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  remainingAmount: number;
  currency: string;
  mode: "FULL" | "PARTIAL" | null;
  partialAmount: number;
  onModeChange: (mode: "FULL" | "PARTIAL") => void;
};

export default function OrderPaymentSelector({
  remainingAmount,
  currency,
  mode,
  partialAmount,
  onModeChange,
}: Props) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Choose payment amount</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant={mode === "FULL" ? "default" : "outline"}
            onClick={() => onModeChange("FULL")}
          >
            Full Payment
          </Button>

          <Button
            type="button"
            variant={mode === "PARTIAL" ? "default" : "outline"}
            onClick={() => onModeChange("PARTIAL")}
          >
            Partial Payment
          </Button>
        </div>

        {mode === "PARTIAL" ? (
          <div className="max-w-sm space-y-2">
            <label className="text-sm font-medium">
              Partial payment amount ({currency})
            </label>
            <Input
              type="number"
              min={1}
              max={remainingAmount}
              step="0.01"
              value={partialAmount}
              //  onChange={(e) => onPartialAmountChange(Number(e.target.value))}
              readOnly
            />
            <p className="text-xs text-muted-foreground">
              You can only submit two split payments and partial payments
              attracts $10.00 added fee.
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
