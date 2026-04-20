import Link from "next/link";
import { AlertCircle, ArrowLeft, CheckCircle2, Clock3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { resolvePaymentoStatus } from "@/lib/payments/crypto/paymentoStatus";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatTargetType(value: string | null) {
  if (value === "INVESTMENT_ORDER") return "Investment order";
  if (value === "SAVINGS_FUNDING") return "Savings funding";
  return null;
}

function statusTone(status: string) {
  const normalized = status.trim().toLowerCase();

  if (
    normalized === "approved" ||
    normalized === "paid" ||
    normalized === "confirmed" ||
    normalized === "completed"
  ) {
    return {
      icon: CheckCircle2,
      className:
        "border-emerald-400/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200",
      title: "Payment submitted",
      note: "Paymento returned a successful status, and we are now verifying it server-side.",
    };
  }

  if (
    normalized === "declined" ||
    normalized === "failed" ||
    normalized === "cancelled"
  ) {
    return {
      icon: AlertCircle,
      className:
        "border-rose-400/20 bg-rose-500/10 text-rose-700 dark:text-rose-200",
      title: "Payment needs attention",
      note: "Paymento returned a non-success status. No settlement has been applied from this page.",
    };
  }

  return {
    icon: Clock3,
    className:
      "border-amber-400/20 bg-amber-500/10 text-amber-700 dark:text-amber-200",
    title: "Payment submitted",
    note: "Your checkout was submitted successfully. We are still verifying it securely on the server.",
  };
}

export default async function PaymentoReturnPage({ searchParams }: Props) {
  const params = await searchParams;

  const provider = single(params.provider) ?? "Paymento";
  const rawStatus =
    single(params.providerStatus) ??
    single(params.status) ??
    single(params.OrderStatus) ??
    single(params.orderStatus) ??
    "processing";
  const resolvedStatus = resolvePaymentoStatus(rawStatus);

  const targetType = single(params.targetType) ?? null;
  const targetId = single(params.targetId) ?? null;
  const fundingMethodType = single(params.fundingMethodType) ?? null;
  const paymentMode = single(params.paymentMode) ?? null;

  const targetLabel = formatTargetType(targetType);
  const backHref =
    targetType && targetId
      ? `/account/dashboard/checkout?targetType=${encodeURIComponent(targetType)}&targetId=${encodeURIComponent(targetId)}${fundingMethodType ? `&fundingMethodType=${encodeURIComponent(fundingMethodType)}` : ""}${paymentMode ? `&paymentMode=${encodeURIComponent(paymentMode)}` : ""}`
      : "/account/dashboard/checkout";

  const tone = statusTone(resolvedStatus.status);
  const Icon = tone.icon;

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-7rem)] max-w-2xl items-center px-4 py-10 md:px-6">
      <Card className="w-full rounded-[1.75rem] border border-slate-200/80 bg-white/88 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.94),rgba(5,11,31,0.98))]">
        <CardHeader className="space-y-4">
          <div
            className={cn(
              "inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium",
              tone.className,
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {resolvedStatus.status}
          </div>

          <div className="space-y-2">
            <CardTitle className="text-2xl font-semibold text-slate-950 dark:text-white">
              {tone.title}
            </CardTitle>
            <CardDescription className="max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              {tone.note}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.04]">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Provider
              </p>
              <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">
                {provider}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.04]">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Target
              </p>
              <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">
                {targetLabel ?? "Checkout"}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.04]">
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
              We received your redirect from Paymento. Final settlement does
              not happen here. Your payment is verified securely on the server
              and your dashboard will update automatically once confirmed.
            </p>

            {targetLabel ? (
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                You can return to the same checkout context for this{" "}
                {targetLabel.toLowerCase()} while verification completes.
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="rounded-full px-5">
              <Link href={backHref}>
                <ArrowLeft className="h-4 w-4" />
                Return to checkout
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="rounded-full px-5 border-slate-200/80 bg-white/80 dark:border-white/10 dark:bg-white/[0.04]"
            >
              <Link href="/account/dashboard">Go to dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
