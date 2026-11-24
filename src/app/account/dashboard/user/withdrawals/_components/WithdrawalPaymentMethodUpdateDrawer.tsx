"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Landmark,
  MapPin,
  Phone,
  UserRound,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { updateWithdrawalPaymentMethod } from "@/actions/accounts/withdrawal/updateWithdrawalPaymentMethod";
import {
  Drawer,
  DrawerClose,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { DrawerSurface } from "@/components/ui/drawer-surface";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { createInitialFormState } from "@/lib/forms/actionState";

type Props = {
  withdrawalId: string;
  paymentMethodLabel: string;
  unavailableReason?: string | null;
};

type MethodType = "WESTERN_UNION" | "CASH_DELIVERY";

type FieldName =
  | "withdrawalId"
  | "methodType"
  | "receiverName"
  | "receiverCountry"
  | "receiverCity"
  | "receiverPhone"
  | "transferReference"
  | "note"
  | "recipientName"
  | "deliveryCountry"
  | "deliveryCity"
  | "deliveryAddress"
  | "contactPhone"
  | "deliveryInstructions";

const initialState = createInitialFormState<FieldName>();

export function WithdrawalPaymentMethodUpdateDrawer({
  withdrawalId,
  paymentMethodLabel,
  unavailableReason,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [methodType, setMethodType] = useState<MethodType>("WESTERN_UNION");

  const [state, formAction, pending] = useActionState(
    updateWithdrawalPaymentMethod,
    initialState,
  );

  const lastToast = useRef<string | null>(null);

  useEffect(() => {
    if (state.status === "idle" || !state.message) {
      return;
    }

    const toastKey = `${state.status}:${state.message}:${withdrawalId}`;

    if (lastToast.current === toastKey) {
      return;
    }

    lastToast.current = toastKey;

    if (state.status === "success") {
      toast.success(state.message);
      setOpen(false);
      router.refresh();
      return;
    }

    toast.error(state.message);
  }, [router, state.message, state.status, withdrawalId]);

  useEffect(() => {
    if (!open) {
      setMethodType("WESTERN_UNION");
    }
  }, [open]);

  const inputClassName =
    "h-11 rounded-xl border-border/70 bg-white text-slate-950 shadow-none placeholder:text-slate-500 focus-visible:ring-sky-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-white";

  const labelClassName =
    "text-sm font-medium text-slate-700 dark:text-slate-200";

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className="h-10 w-full rounded-xl bg-[#3c9ee0] font-medium text-white hover:bg-[#2f8bd0] sm:w-auto"
      >
        Update payment method
      </Button>

      <DrawerSurface
        tone="light"
        className={cn(
          "z-[90] flex flex-col overflow-hidden border-border/70 bg-white text-slate-950 shadow-[0_32px_90px_rgba(15,23,42,0.24)]",
          "data-[vaul-drawer-direction=bottom]:h-[92dvh]",
          "data-[vaul-drawer-direction=bottom]:max-h-[92dvh]",
          "data-[vaul-drawer-direction=bottom]:rounded-t-[1.75rem]",
          "dark:border-white/10 dark:bg-slate-950 dark:text-white",
        )}
      >
        <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col overflow-hidden">
          <DrawerHeader className="shrink-0 border-b border-border/60 px-4 pb-5 pt-5 text-left md:px-6">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300">
              <AlertCircle className="h-5 w-5" />
            </div>

            <DrawerTitle className="text-left text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
              Update payment method
            </DrawerTitle>

            <DrawerDescription className="mt-1 text-left text-sm leading-6 text-slate-600 dark:text-slate-400">
              Your original payment method needs to be replaced. Provide
              alternative payout details to continue processing your withdrawal.
            </DrawerDescription>
          </DrawerHeader>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 [-webkit-overflow-scrolling:touch] md:px-6">
            <div className="space-y-6">
              <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4 dark:border-amber-400/20 dark:bg-amber-400/[0.07]">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-800 dark:text-amber-300">
                  Original payment method
                </p>

                <p className="mt-2 text-sm font-semibold text-amber-950 dark:text-amber-100">
                  {paymentMethodLabel}
                </p>

                {unavailableReason ? (
                  <p className="mt-1 text-sm leading-5 text-amber-900/80 dark:text-amber-100/80">
                    {unavailableReason}
                  </p>
                ) : (
                  <p className="mt-1 text-sm leading-5 text-amber-900/80 dark:text-amber-100/80">
                    This payment method is currently unavailable for your
                    withdrawal.
                  </p>
                )}
              </div>

              <form action={formAction} className="space-y-6">
                <input type="hidden" name="withdrawalId" value={withdrawalId} />

                <input type="hidden" name="methodType" value={methodType} />

                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
                      Choose an alternative
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                      Select how you would like to receive your withdrawal.
                    </p>
                  </div>

                  <Tabs
                    value={methodType}
                    onValueChange={(value) =>
                      setMethodType(value as MethodType)
                    }
                  >
                    <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-2xl bg-slate-100/90 p-1 dark:bg-white/[0.05]">
                      <TabsTrigger
                        value="WESTERN_UNION"
                        className="h-auto min-h-16 rounded-xl px-3 py-3 text-slate-700 data-active:bg-white data-active:text-sky-900 data-active:shadow-sm dark:text-slate-300 dark:data-active:bg-white/[0.09] dark:data-active:text-sky-300"
                      >
                        <div className="flex items-center gap-2">
                          <Wallet className="h-5 w-5 shrink-0" />
                          <span className="text-sm font-medium">
                            Western Union
                          </span>
                          {methodType === "WESTERN_UNION" ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : null}
                        </div>
                      </TabsTrigger>

                      <TabsTrigger
                        value="CASH_DELIVERY"
                        className="h-auto min-h-16 rounded-xl px-3 py-3 text-slate-700 data-active:bg-white data-active:text-sky-900 data-active:shadow-sm dark:text-slate-300 dark:data-active:bg-white/[0.09] dark:data-active:text-sky-300"
                      >
                        <div className="flex items-center gap-2">
                          <Landmark className="h-5 w-5 shrink-0" />
                          <span className="text-sm font-medium">
                            Cash delivery
                          </span>
                          {methodType === "CASH_DELIVERY" ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : null}
                        </div>
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {methodType === "WESTERN_UNION" ? (
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 border-b border-border/60 pb-3 dark:border-white/10">
                      <UserRound className="h-4 w-4 text-sky-800 dark:text-sky-300" />
                      <div>
                        <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
                          Receiver information
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          Enter the recipient's transfer details.
                        </p>
                      </div>
                    </div>

                    <FieldGroup className="gap-5">
                      <Field
                        data-invalid={
                          Boolean(state.fieldErrors?.receiverName) || undefined
                        }
                      >
                        <FieldLabel className={labelClassName}>
                          Receiver name
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            name="receiverName"
                            placeholder="Full name of the receiver"
                            className={inputClassName}
                          />
                          {state.fieldErrors?.receiverName ? (
                            <FieldError
                              errors={state.fieldErrors.receiverName.map(
                                (message) => ({ message }),
                              )}
                            />
                          ) : null}
                        </FieldContent>
                      </Field>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field
                          data-invalid={
                            Boolean(state.fieldErrors?.receiverCountry) ||
                            undefined
                          }
                        >
                          <FieldLabel className={labelClassName}>
                            Receiver country
                          </FieldLabel>
                          <FieldContent>
                            <Input
                              name="receiverCountry"
                              placeholder="Country"
                              className={inputClassName}
                            />
                            {state.fieldErrors?.receiverCountry ? (
                              <FieldError
                                errors={state.fieldErrors.receiverCountry.map(
                                  (message) => ({ message }),
                                )}
                              />
                            ) : null}
                          </FieldContent>
                        </Field>

                        <Field
                          data-invalid={
                            Boolean(state.fieldErrors?.receiverCity) ||
                            undefined
                          }
                        >
                          <FieldLabel className={labelClassName}>
                            Receiver city
                          </FieldLabel>
                          <FieldContent>
                            <Input
                              name="receiverCity"
                              placeholder="City"
                              className={inputClassName}
                            />
                            {state.fieldErrors?.receiverCity ? (
                              <FieldError
                                errors={state.fieldErrors.receiverCity.map(
                                  (message) => ({ message }),
                                )}
                              />
                            ) : null}
                          </FieldContent>
                        </Field>
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field
                          data-invalid={
                            Boolean(state.fieldErrors?.receiverPhone) ||
                            undefined
                          }
                        >
                          <FieldLabel className={labelClassName}>
                            Receiver phone
                          </FieldLabel>
                          <FieldContent>
                            <Input
                              name="receiverPhone"
                              inputMode="tel"
                              placeholder="Phone number"
                              className={inputClassName}
                            />
                            {state.fieldErrors?.receiverPhone ? (
                              <FieldError
                                errors={state.fieldErrors.receiverPhone.map(
                                  (message) => ({ message }),
                                )}
                              />
                            ) : null}
                          </FieldContent>
                        </Field>

                        <Field>
                          <FieldLabel className={labelClassName}>
                            Transfer reference
                          </FieldLabel>
                          <FieldContent>
                            <Input
                              name="transferReference"
                              placeholder="Optional reference"
                              className={inputClassName}
                            />
                          </FieldContent>
                        </Field>
                      </div>
                    </FieldGroup>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 border-b border-border/60 pb-3 dark:border-white/10">
                      <MapPin className="h-4 w-4 text-sky-800 dark:text-sky-300" />
                      <div>
                        <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
                          Delivery information
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          Provide the recipient and delivery location.
                        </p>
                      </div>
                    </div>

                    <FieldGroup className="gap-5">
                      <Field
                        data-invalid={
                          Boolean(state.fieldErrors?.recipientName) || undefined
                        }
                      >
                        <FieldLabel className={labelClassName}>
                          Recipient name
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            name="recipientName"
                            placeholder="Full name of the recipient"
                            className={inputClassName}
                          />
                          {state.fieldErrors?.recipientName ? (
                            <FieldError
                              errors={state.fieldErrors.recipientName.map(
                                (message) => ({ message }),
                              )}
                            />
                          ) : null}
                        </FieldContent>
                      </Field>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field
                          data-invalid={
                            Boolean(state.fieldErrors?.deliveryCountry) ||
                            undefined
                          }
                        >
                          <FieldLabel className={labelClassName}>
                            Delivery country
                          </FieldLabel>
                          <FieldContent>
                            <Input
                              name="deliveryCountry"
                              placeholder="Country"
                              className={inputClassName}
                            />
                            {state.fieldErrors?.deliveryCountry ? (
                              <FieldError
                                errors={state.fieldErrors.deliveryCountry.map(
                                  (message) => ({ message }),
                                )}
                              />
                            ) : null}
                          </FieldContent>
                        </Field>

                        <Field
                          data-invalid={
                            Boolean(state.fieldErrors?.deliveryCity) ||
                            undefined
                          }
                        >
                          <FieldLabel className={labelClassName}>
                            Delivery city
                          </FieldLabel>
                          <FieldContent>
                            <Input
                              name="deliveryCity"
                              placeholder="City"
                              className={inputClassName}
                            />
                            {state.fieldErrors?.deliveryCity ? (
                              <FieldError
                                errors={state.fieldErrors.deliveryCity.map(
                                  (message) => ({ message }),
                                )}
                              />
                            ) : null}
                          </FieldContent>
                        </Field>
                      </div>

                      <Field
                        data-invalid={
                          Boolean(state.fieldErrors?.deliveryAddress) ||
                          undefined
                        }
                      >
                        <FieldLabel className={labelClassName}>
                          Delivery address
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            name="deliveryAddress"
                            placeholder="Street address or pickup location"
                            className={inputClassName}
                          />
                          {state.fieldErrors?.deliveryAddress ? (
                            <FieldError
                              errors={state.fieldErrors.deliveryAddress.map(
                                (message) => ({ message }),
                              )}
                            />
                          ) : null}
                        </FieldContent>
                      </Field>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field
                          data-invalid={
                            Boolean(state.fieldErrors?.contactPhone) ||
                            undefined
                          }
                        >
                          <FieldLabel className={labelClassName}>
                            Contact phone
                          </FieldLabel>
                          <FieldContent>
                            <Input
                              name="contactPhone"
                              inputMode="tel"
                              placeholder="Phone number"
                              className={inputClassName}
                            />
                            {state.fieldErrors?.contactPhone ? (
                              <FieldError
                                errors={state.fieldErrors.contactPhone.map(
                                  (message) => ({ message }),
                                )}
                              />
                            ) : null}
                          </FieldContent>
                        </Field>

                        <Field>
                          <FieldLabel className={labelClassName}>
                            Delivery instructions
                          </FieldLabel>
                          <FieldContent>
                            <Input
                              name="deliveryInstructions"
                              placeholder="Optional instructions"
                              className={inputClassName}
                            />
                          </FieldContent>
                        </Field>
                      </div>
                    </FieldGroup>
                  </div>
                )}

                <div className="space-y-3 border-t border-border/60 pt-5 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-sky-800 dark:text-sky-300" />
                    <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
                      Additional notes
                    </h3>
                  </div>

                  <Field>
                    <FieldLabel className={labelClassName}>Notes</FieldLabel>
                    <FieldContent>
                      <Textarea
                        name="note"
                        rows={4}
                        placeholder="Optional note for the processing team"
                        className="rounded-xl border-border/70 bg-white text-slate-950 placeholder:text-slate-500 shadow-none focus-visible:ring-sky-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                      />
                      {state.fieldErrors?.note ? (
                        <FieldError
                          errors={state.fieldErrors.note.map((message) => ({
                            message,
                          }))}
                        />
                      ) : null}
                    </FieldContent>
                  </Field>
                </div>

                {state.status === "error" && state.message ? (
                  <Alert className="rounded-2xl border border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-100">
                    <AlertTitle>{state.message}</AlertTitle>
                  </Alert>
                ) : null}

                <DrawerFooter className="sticky bottom-0 -mx-4 border-t border-border/60 bg-white/95 px-4 pb-4 pt-4 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95 md:-mx-6 md:px-6">
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <DrawerClose asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 w-full rounded-xl border-border/70 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100 dark:hover:bg-white/[0.08] sm:w-auto"
                      >
                        Cancel
                      </Button>
                    </DrawerClose>

                    <Button
                      type="submit"
                      disabled={pending}
                      className="h-11 w-full gap-2 rounded-xl bg-[#3c9ee0] font-semibold text-white hover:bg-[#2f8bd0] sm:w-auto"
                    >
                      {pending ? "Saving..." : "Update details"}
                      {!pending ? <ArrowRight className="h-4 w-4" /> : null}
                    </Button>
                  </div>
                </DrawerFooter>
              </form>
            </div>
          </div>
        </div>
      </DrawerSurface>
    </Drawer>
  );
}
