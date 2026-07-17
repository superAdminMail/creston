"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";

import { respondToInvestmentOrderBankInfoRequest } from "@/actions/admin/investment-payments/respondToInvestmentOrderBankInfoRequest";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { RespondToInvestmentOrderBankInfoRequestState } from "@/actions/admin/investment-payments/respondToInvestmentOrderBankInfoRequest";
import type { InvestmentBankInfoRequestItem } from "@/lib/types/payments/investmentPaymentReview.types";
import { DashboardActionSubmitButton } from "../../../_components/DashboardActionSubmitButton";

const initialState: RespondToInvestmentOrderBankInfoRequestState = {
  status: "idle",
};

export default function InvestmentBankInfoRequestForm({
  request,
}: {
  request: InvestmentBankInfoRequestItem;
}) {
  const [state, formAction] = useActionState(
    respondToInvestmentOrderBankInfoRequest,
    initialState,
  );
  const lastToastKey = useRef<string | null>(null);

  useEffect(() => {
    if (state.status === "idle" || !state.message) {
      return;
    }

    const toastKey = `${state.status}:${state.message}:${request.orderId}`;

    if (lastToastKey.current === toastKey) {
      return;
    }

    lastToastKey.current = toastKey;

    if (state.status === "success") {
      toast.success(state.message);
      return;
    }

    toast.error(state.message);
  }, [request.orderId, state.message, state.status]);

  return (
    <Card className="overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-sm">
      <CardHeader className="space-y-2 px-4 pt-5 sm:px-6 sm:pt-6">
        <CardTitle className="text-lg text-slate-950 dark:text-white">
          Send bank details for {request.order.plan.name}
        </CardTitle>
        <p className="max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          Requested by{" "}
          {request.requester.name ?? request.requester.email ?? "Unknown"} for
          order {request.orderId}.
        </p>
      </CardHeader>

      <CardContent className="px-4 pb-5 sm:px-6 sm:pb-6">
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="orderId" value={request.orderId} />
          <input type="hidden" name="type" value="BANK_INFO" />
          <input type="hidden" name="currency" value={request.order.currency} />
          <input type="hidden" name="isPrivate" value="true" />
          <input type="hidden" name="isActive" value="true" />
          <input type="hidden" name="isDefault" value="false" />
          <input type="hidden" name="sortOrder" value="0" />
          <input type="hidden" name="verificationStatus" value="VERIFIED" />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Label
              </label>
              <Input
                name="label"
                defaultValue={`Bank details for ${request.order.plan.name}`}
                required
                className="h-11 rounded-2xl border-border/70 bg-background px-4 text-slate-800 shadow-sm dark:text-slate-100"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Provider name
              </label>
              <Input
                name="providerName"
                placeholder="Bank or provider name"
                className="h-11 rounded-2xl border-border/70 bg-background px-4 text-slate-800 shadow-sm dark:text-slate-100"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Country
              </label>
              <Input
                name="country"
                placeholder="Country"
                className="h-11 rounded-2xl border-border/70 bg-background px-4 text-slate-800 shadow-sm dark:text-slate-100"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Bank name
              </label>
              <Input
                name="bankName"
                required
                placeholder="Bank name"
                className="h-11 rounded-2xl border-border/70 bg-background px-4 text-slate-800 shadow-sm dark:text-slate-100"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Bank code
              </label>
              <Input
                name="bankCode"
                placeholder="Bank code or sort code"
                className="h-11 rounded-2xl border-border/70 bg-background px-4 text-slate-800 shadow-sm dark:text-slate-100"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Account name
              </label>
              <Input
                name="accountName"
                required
                placeholder="Account name"
                className="h-11 rounded-2xl border-border/70 bg-background px-4 text-slate-800 shadow-sm dark:text-slate-100"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Reference
              </label>
              <Input
                name="reference"
                placeholder="Optional payment reference"
                className="h-11 rounded-2xl border-border/70 bg-background px-4 text-slate-800 shadow-sm dark:text-slate-100"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Bank address
              </label>
              <Input
                name="bankAddress"
                placeholder="Optional bank address"
                className="h-11 rounded-2xl border-border/70 bg-background px-4 text-slate-800 shadow-sm dark:text-slate-100"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Account number
              </label>
              <Input
                name="accountNumber"
                required
                placeholder="Account number"
                className="h-11 rounded-2xl border-border/70 bg-background px-4 text-slate-800 shadow-sm dark:text-slate-100"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
                IBAN
              </label>
              <Input
                name="iban"
                placeholder="Optional IBAN"
                className="h-11 rounded-2xl border-border/70 bg-background px-4 text-slate-800 shadow-sm dark:text-slate-100"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Swift code
              </label>
              <Input
                name="swiftCode"
                placeholder="Optional SWIFT/BIC"
                className="h-11 rounded-2xl border-border/70 bg-background px-4 text-slate-800 shadow-sm dark:text-slate-100"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Routing number
              </label>
              <Input
                name="routingNumber"
                placeholder="Optional routing number"
                className="h-11 rounded-2xl border-border/70 bg-background px-4 text-slate-800 shadow-sm dark:text-slate-100"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Branch name
              </label>
              <Input
                name="branchName"
                placeholder="Optional branch"
                className="h-11 rounded-2xl border-border/70 bg-background px-4 text-slate-800 shadow-sm dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Instructions
            </label>
            <Textarea
              name="instructions"
              rows={4}
              placeholder="Transfer instructions the user should follow."
              className="rounded-2xl border-border/70 bg-background px-4 py-3 text-slate-800 shadow-sm dark:text-slate-100"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Notes
            </label>
            <Textarea
              name="notes"
              rows={3}
              placeholder="Internal or user-facing notes."
              className="rounded-2xl border-border/70 bg-background px-4 py-3 text-slate-800 shadow-sm dark:text-slate-100"
            />
          </div>

          {state.message ? (
            <div
              className={`rounded-xl border px-4 py-3 text-sm ${
                state.status === "success"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : "border-destructive/30 bg-destructive/10 text-destructive"
              }`}
            >
              {state.message}
            </div>
          ) : null}

          <div className="flex justify-end">
            <DashboardActionSubmitButton
              idleLabel="Send bank details to user"
              pendingLabel="Sending bank details..."
              className="w-full sm:w-auto"
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
