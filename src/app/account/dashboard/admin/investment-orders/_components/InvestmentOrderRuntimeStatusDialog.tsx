"use client";

import type { ReactNode } from "react";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { pauseAdminInvestmentOrder } from "@/actions/admin/investment-order/pauseAdminInvestmentOrder";
import { resumeAdminInvestmentOrder } from "@/actions/admin/investment-order/resumeAdminInvestmentOrder";
import {
  createInitialFormState,
  getFirstFormFieldError,
} from "@/lib/forms/actionState";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type RuntimeActionFieldName = "orderId" | "allowUpgrade" | "upgradeAmount";
const initialRuntimeActionState =
  createInitialFormState<RuntimeActionFieldName>();

export function InvestmentOrderRuntimeStatusDialog({
  orderId,
  title,
  description,
  submitLabel,
  pendingLabel,
  action,
  trigger,
  icon,
  buttonClassName,
  showUpgradeFields = false,
}: {
  orderId: string;
  title: string;
  description: string;
  submitLabel: string;
  pendingLabel?: string;
  action: typeof pauseAdminInvestmentOrder | typeof resumeAdminInvestmentOrder;
  trigger: ReactNode;
  icon?: ReactNode;
  buttonClassName: string;
  showUpgradeFields?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    action,
    initialRuntimeActionState,
  );
  const [allowUpgrade, setAllowUpgrade] = useState(false);
  const [upgradeAmount, setUpgradeAmount] = useState("");
  const [clientUpgradeAmountError, setClientUpgradeAmountError] = useState<
    string | null
  >(null);
  const runtimeFieldErrors = state.fieldErrors as
    | Partial<Record<RuntimeActionFieldName, string[]>>
    | undefined;
  const resolvedPendingLabel = pendingLabel ?? `${submitLabel}...`;

  useEffect(() => {
    if (state.status === "idle" || !state.message) {
      return;
    }

    if (state.status === "success") {
      toast.success(state.message);
      const timer = window.setTimeout(() => {
        setOpen(false);
        router.refresh();
      }, 0);

      return () => window.clearTimeout(timer);
    }

    toast.error(
      getFirstFormFieldError(runtimeFieldErrors) ?? state.message,
    );
  }, [router, runtimeFieldErrors, state.message, state.status]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="border-white/10 text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-slate-400">
            {description}
          </DialogDescription>
        </DialogHeader>

        <form
          action={formAction}
          className="space-y-4"
          onSubmit={(event) => {
            if (!showUpgradeFields) {
              return;
            }

            if (!allowUpgrade) {
              setClientUpgradeAmountError(null);
              return;
            }

            const parsedUpgradeAmount = Number(upgradeAmount);

            if (
              !upgradeAmount.trim().length ||
              !Number.isFinite(parsedUpgradeAmount) ||
              parsedUpgradeAmount <= 0
            ) {
              event.preventDefault();
              setClientUpgradeAmountError(
                "Enter a valid upgrade amount greater than zero.",
              );
              return;
            }

            setClientUpgradeAmountError(null);
          }}
        >
          <input type="hidden" name="orderId" value={orderId} />

          {showUpgradeFields ? (
            <>
              <input
                type="hidden"
                name="allowUpgrade"
                value={allowUpgrade ? "true" : "false"}
              />

              <Field>
                <FieldLabel className="text-slate-200">
                  Allow upgrade on this order
                </FieldLabel>
                <FieldContent>
                  <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-white">
                        Enable the upgrade route
                      </p>
                      <p className="text-xs leading-5 text-slate-400">
                        When enabled, users can open the upgrade flow from this
                        paused order.
                      </p>
                    </div>
                    <Switch
                      checked={allowUpgrade}
                      onCheckedChange={(checked) => {
                        const nextChecked = checked === true;
                        setAllowUpgrade(nextChecked);

                        if (!nextChecked) {
                          setUpgradeAmount("");
                          setClientUpgradeAmountError(null);
                        }
                      }}
                    />
                  </div>
                </FieldContent>
              </Field>

              {allowUpgrade ? (
                  <Field
                    data-invalid={
                      Boolean(
                        clientUpgradeAmountError ||
                          runtimeFieldErrors?.upgradeAmount?.length,
                      ) || undefined
                  }
                >
                  <FieldLabel className="text-slate-200">
                    Upgrade amount
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      name="upgradeAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      value={upgradeAmount}
                      onChange={(event) => {
                        setUpgradeAmount(event.target.value);

                        if (clientUpgradeAmountError) {
                          setClientUpgradeAmountError(null);
                        }
                      }}
                      placeholder="Enter the exact amount"
                      className="rounded-2xl border-white/10 bg-white/[0.03] text-white placeholder:text-slate-500"
                    />

                    {clientUpgradeAmountError ? (
                      <FieldError errors={[{ message: clientUpgradeAmountError }]} />
                    ) : null}

                    {runtimeFieldErrors?.upgradeAmount ? (
                      <FieldError
                        errors={runtimeFieldErrors.upgradeAmount.map(
                          (message) => ({
                            message,
                          }),
                        )}
                      />
                    ) : null}
                  </FieldContent>
                </Field>
              ) : null}
            </>
          ) : null}

          {state.status === "error" && state.message ? (
            <p className="text-sm text-rose-300">{state.message}</p>
          ) : null}

          <DialogFooter className="border-white/10 bg-transparent px-0 pb-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-2xl border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08]"
            >
              Dismiss
            </Button>
              <Button
              type="submit"
              disabled={pending}
              className={cn("rounded-2xl", buttonClassName)}
            >
              {icon}
              {pending ? resolvedPendingLabel : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
