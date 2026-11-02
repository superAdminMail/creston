"use client";

import type { ReactNode } from "react";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateInvestmentOrderCapitalOffer } from "@/actions/super-admin/investment-orders/updateInvestmentOrderCapitalOffer";
import {
  createInitialFormState,
  getFirstFormFieldError,
} from "@/lib/forms/actionState";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

type FieldName = "orderId" | "allowCapitalUpdate" | "capitalUpdateReason";

const initialState = createInitialFormState<FieldName>();

export function CapitalUpdateOfferDialog({
  orderId,
  orderAmount,
  currentReason,
  isEnabled,
  trigger,
}: {
  orderId: string;
  orderAmount: string;
  currentReason: string | null;
  isEnabled: boolean;
  trigger: ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(isEnabled);
  const [reason, setReason] = useState(currentReason ?? "");
  const [state, formAction, pending] = useActionState(
    updateInvestmentOrderCapitalOffer,
    initialState,
  );

  useEffect(() => {
    if (state.status === "idle" || !state.message) return;

    if (state.status === "success") {
      toast.success(state.message);
      const timer = window.setTimeout(() => {
        setOpen(false);
        router.refresh();
      }, 0);

      return () => window.clearTimeout(timer);
    }

    toast.error(getFirstFormFieldError(state.fieldErrors) ?? state.message);
  }, [router, state.fieldErrors, state.message, state.status]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-1rem)] overflow-y-auto border-border/60 bg-white/95 text-slate-950 sm:max-w-lg dark:border-white/10 dark:bg-slate-950/95 dark:text-white">
        <DialogHeader>
          <DialogTitle>Update order capital</DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Make a capital update available for this confirmed order.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="orderId" value={orderId} />
          <input
            type="hidden"
            name="allowCapitalUpdate"
            value={enabled ? "true" : "false"}
          />

          <Field>
            <FieldLabel className="text-slate-700 dark:text-slate-200">
              Allow capital update
            </FieldLabel>
            <FieldContent>
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-sky-200/70 bg-sky-50/70 p-4 dark:border-sky-400/20 dark:bg-sky-400/10">
                <p className="text-sm leading-6 text-slate-700 dark:text-slate-200">
                  Show the investor a capital update option for this order.
                </p>
                <Switch checked={enabled} onCheckedChange={setEnabled} />
              </div>
            </FieldContent>
          </Field>

          {enabled ? (
            <>
              <Field>
                <FieldLabel className="text-slate-700 dark:text-slate-200">
                  Capital update amount
                </FieldLabel>
                <FieldContent>
                  <div className="rounded-2xl border border-border/60 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-white">
                    {orderAmount}
                  </div>
                </FieldContent>
              </Field>

              <Field
                data-invalid={
                  Boolean(state.fieldErrors?.capitalUpdateReason) || undefined
                }
              >
                <FieldLabel className="text-slate-700 dark:text-slate-200">
                  Reason
                </FieldLabel>
                <FieldContent>
                  <Textarea
                    name="capitalUpdateReason"
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    rows={4}
                    placeholder="Explain why this capital update is available."
                    className="rounded-2xl border-border/60 bg-white/90 text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                  />
                  {state.fieldErrors?.capitalUpdateReason ? (
                    <FieldError
                      errors={state.fieldErrors.capitalUpdateReason.map(
                        (message) => ({ message }),
                      )}
                    />
                  ) : null}
                </FieldContent>
              </Field>
            </>
          ) : null}

          <DialogFooter className="border-border/60 px-0 pb-0 pt-2 dark:border-white/10">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
            <Button
              type="submit"
              disabled={pending}
              className="bg-sky-600 hover:bg-sky-500"
            >
              {pending
                ? "Saving..."
                : enabled
                  ? "Save capital update"
                  : "Remove capital update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
