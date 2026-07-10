"use client";

import type { ReactNode } from "react";
import { Bitcoin, Landmark } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CheckoutFundingMethodType } from "@/lib/types/payments/checkout.types";
import { DASHBOARD_PAGE_PANEL_CLASS } from "../../_components/dashboardSurfaces";

type Props = {
  value: CheckoutFundingMethodType | null;
  onChange: (value: CheckoutFundingMethodType) => void;
  title?: string;
  description?: string;
  showCryptoHint?: boolean;
  className?: string;
};

function MethodTile({
  active,
  icon,
  title,
  description,
  onClick,
  variant = "bank",
}: {
  active: boolean;
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  variant?: "bank" | "crypto";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex h-full flex-col rounded-[1.5rem] border p-4 text-left transition-[transform,background-color,border-color,box-shadow]",
        active
          ? "border-sky-300/60 bg-sky-50/90 shadow-sm"
          : "border-slate-200/80 bg-white/90 shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]",
      )}
    >
      {active ? (
        <span className="absolute right-4 top-4 rounded-full border border-sky-200/70 bg-sky-600 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white shadow-sm dark:border-white/10 dark:bg-white dark:text-slate-950">
          Selected
        </span>
      ) : null}

      <div
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-2xl border text-white transition-[transform,background-color,border-color,box-shadow]",
          active
            ? "border-sky-300/40 bg-sky-600 text-white"
            : variant === "crypto"
              ? "border-amber-300/30 bg-amber-400/20 text-amber-500 group-hover:bg-amber-400/25 dark:bg-amber-400/20 dark:text-amber-200"
              : "border-white/10 bg-slate-950 text-slate-200 group-hover:bg-slate-900 dark:border-white/10 dark:bg-white/10 dark:text-white",
        )}
      >
        {icon}
      </div>
      <p className="mt-4 text-base font-semibold text-slate-950 dark:text-white">
        {title}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
        {description}
      </p>
    </button>
  );
}

export default function CheckoutFundingMethodSelector({
  value = "BANK_TRANSFER",
  onChange,
  title = "Choose funding method",
  description = "Select a funding method to continue.",
  showCryptoHint = true,
  className,
}: Props) {
  return (
    <Card className={cn(DASHBOARD_PAGE_PANEL_CLASS, className)}>
      <CardHeader className="space-y-2">
        <CardTitle className="text-lg text-slate-950 dark:text-white">
          {title}
        </CardTitle>
        <CardDescription className="text-sm leading-6 text-slate-600 dark:text-slate-400">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-3 md:grid-cols-2">
        <MethodTile
          active={value === "BANK_TRANSFER"}
          icon={<Landmark className="h-4 w-4" />}
          title="Bank Transfer"
          description="Use the bank transfer route to continue."
          onClick={() => onChange("BANK_TRANSFER")}
        />
        <MethodTile
          active={value === "CRYPTO_PROVIDER"}
          icon={<Bitcoin className="h-4 w-4" />}
          variant="crypto"
          title="Crypto wallet"
          description={
            showCryptoHint
              ? "Continue with crypto if you already own bitcoin or can use the BTC ATM. If not, you can use wire transfer instead."
              : "Use the crypto checkout route to continue."
          }
          onClick={() => onChange("CRYPTO_PROVIDER")}
        />
      </CardContent>
    </Card>
  );
}
