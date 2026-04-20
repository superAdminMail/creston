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
}: {
  active: boolean;
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex h-full flex-col rounded-[1.5rem] border p-4 text-left transition-all",
        active
          ? "border-blue-400/40 bg-blue-500/10 shadow-[0_18px_40px_rgba(37,99,235,0.18)]"
          : "border-slate-200/80 bg-white/75 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]",
      )}
    >
      <div
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-2xl border text-white transition-all",
          active
            ? "border-blue-300/30 bg-blue-500 text-white"
            : "border-white/10 bg-slate-950 text-slate-200 group-hover:bg-slate-900 dark:bg-white/10 dark:text-white",
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
  value,
  onChange,
  title = "Choose funding method",
  description = "Select a funding method to continue.",
  showCryptoHint = true,
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
        <MethodTile
          active={value === "BANK_TRANSFER"}
          icon={<Landmark className="h-4 w-4" />}
          title="Bank Transfer"
          description="Use the bank transfer route to continue.."
          onClick={() => onChange("BANK_TRANSFER")}
        />
        <MethodTile
          active={value === "CRYPTO_PROVIDER"}
          icon={<Bitcoin className="h-4 w-4" />}
          title="Crypto wallet"
          description={
            showCryptoHint
              ? "Route the payment through our crypto checkout and keep the flow tied to this session."
              : "Use the crypto checkout route to continue."
          }
          onClick={() => onChange("CRYPTO_PROVIDER")}
        />
      </CardContent>
    </Card>
  );
}
