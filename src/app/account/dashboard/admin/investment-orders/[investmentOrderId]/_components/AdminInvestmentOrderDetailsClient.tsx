"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarClock,
  FileText,
  PauseCircle,
  PlayCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { confirmInvestmentOrder } from "@/actions/admin/investment-order/confirmInvestmentOrder";
import { pauseAdminInvestmentOrder } from "@/actions/admin/investment-order/pauseAdminInvestmentOrder";
import { resumeAdminInvestmentOrder } from "@/actions/admin/investment-order/resumeAdminInvestmentOrder";
import type { AdminInvestmentOrderDetails } from "@/actions/admin/investment-order/getAdminInvestmentOrderDetails";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InvestmentOrderRuntimeStatusDialog } from "../../_components/InvestmentOrderRuntimeStatusDialog";

const initialState = { status: "idle" as const };
function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-white">{value}</p>
    </div>
  );
}

export function AdminInvestmentOrderDetailsClient({
  order,
}: {
  order: AdminInvestmentOrderDetails;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    confirmInvestmentOrder,
    initialState,
  );

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [router, state.status]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Link
          href="/account/dashboard/admin/investment-orders"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to investment orders
        </Link>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white">{order.planName}</h1>
            <p className="text-sm leading-7 text-slate-400">
              {order.investorName} | {order.investorEmail} | {order.investmentName}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            {order.canConfirm ? (
              <form action={formAction}>
                <input type="hidden" name="orderId" value={order.id} />
                <Button
                  type="submit"
                  disabled={pending}
                  className="rounded-2xl bg-blue-500 hover:bg-blue-600"
                >
                  <BadgeCheck className="mr-2 h-4 w-4" />
                  {pending ? "Confirming order..." : "Confirm investment order"}
                </Button>
              </form>
            ) : null}

            {order.canPause ? (
              <InvestmentOrderRuntimeStatusDialog
                orderId={order.id}
                action={pauseAdminInvestmentOrder}
                trigger={
                <Button
                  type="button"
                  className="rounded-2xl border border-amber-400/20 bg-amber-400/10 text-amber-100 hover:bg-amber-400/15"
                >
                  <PauseCircle className="h-4 w-4" />
                  Pause order
                </Button>
              }
                buttonClassName="bg-amber-600 hover:bg-amber-500"
                title="Pause investment order"
                description="Pause this confirmed investment order to stop accrual until it is resumed."
                submitLabel="Pause order"
                showUpgradeFields
              />
            ) : null}

            {order.canResume ? (
              <InvestmentOrderRuntimeStatusDialog
                orderId={order.id}
                action={resumeAdminInvestmentOrder}
                trigger={
                <Button
                  type="button"
                  className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/15"
                >
                  <PlayCircle className="h-4 w-4" />
                  Resume order
                </Button>
              }
                buttonClassName="bg-emerald-600 hover:bg-emerald-500"
                title="Resume investment order"
                description="Resume this paused investment order so accrual can continue."
                submitLabel="Resume order"
              />
            ) : null}
          </div>
        </div>
      </div>

      {state.status !== "idle" && state.message ? (
      <Alert
        className={
          state.status === "success"
            ? "rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
            : "rounded-2xl border border-red-400/20 bg-red-400/10 text-red-100"
        }
      >
        <AlertTitle>{state.message}</AlertTitle>
      </Alert>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <InfoCard label="Status" value={order.statusLabel} />
        <InfoCard label="Runtime status" value={order.runtimeStatusLabel} />
        <InfoCard label="Amount" value={order.amount} />
        <InfoCard label="Investment model" value={order.modelLabel} />
        <InfoCard label="KYC status" value={order.investorKycStatus} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Card className="rounded-[1.75rem] border border-white/10 bg-white/5">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-300" />
                <h2 className="text-lg font-semibold text-white">Order details</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <InfoCard label="Payment reference" value={order.paymentReference} />
                <InfoCard label="Payment date" value={order.paymentDate} />
                <InfoCard label="Confirmed date" value={order.confirmedDate} />
                <InfoCard label="Created date" value={order.createdDate} />
                <InfoCard label="Tier" value={order.tierLabel} />
                <InfoCard label="ROI" value={order.roiPercentLabel} />
                <InfoCard label="Expected return" value={order.expectedReturn} />
                <InfoCard label="Accrued profit" value={order.accruedProfit} />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem] border border-white/10 bg-white/5">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-emerald-300" />
                <h2 className="text-lg font-semibold text-white">Lifecycle</h2>
              </div>
              <p className="text-sm leading-6 text-slate-400">
                Start and maturity dates are anchored when the order is confirmed.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <InfoCard label="Start date" value={order.startDate} />
                <InfoCard label="Maturity date" value={order.maturityDate} />
                <InfoCard label="Plan period" value={order.planPeriodLabel} />
                <InfoCard label="Plan duration" value={order.planDurationLabel} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[1.75rem] border border-white/10 bg-white/5">
            <CardContent className="space-y-4 p-6">
              <h2 className="text-lg font-semibold text-white">Investor & account</h2>
              <InfoCard label="Investor" value={order.investorName} />
              <InfoCard label="Investment account" value={order.accountName} />
              <InfoCard label="Account status" value={order.accountStatusLabel} />
              <InfoCard label="Opened at" value={order.accountOpenedAt} />
              <InfoCard label="Investment type" value={order.investmentTypeLabel} />
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem] border border-white/10 bg-white/5">
            <CardContent className="space-y-4 p-6">
              <h2 className="text-lg font-semibold text-white">Admin notes</h2>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm leading-7 text-slate-300">
                {order.adminNotes || "No admin notes recorded for this order."}
              </div>

                <h3 className="text-sm font-medium text-slate-200">
                  {order.status === "REJECTED"
                    ? "Rejection reason"
                    : "Cancellation reason"}
                </h3>
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm leading-7 text-slate-300">
                  {order.cancellationReason ||
                    (order.status === "REJECTED"
                      ? "No rejection reason recorded."
                      : "No cancellation reason recorded.")}
                </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
