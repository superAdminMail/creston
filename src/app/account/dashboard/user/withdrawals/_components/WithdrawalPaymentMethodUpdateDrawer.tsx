"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Landmark, Wallet } from "lucide-react";
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
import { DrawerSurface } from "@/components/ui/drawer-surface";

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

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-full bg-[#3c9ee0] text-white hover:bg-[#2f8bd0] sm:w-auto"
      >
        Update payment method
      </Button>

      <DrawerSurface
        tone="dark"
        className="data-[vaul-drawer-direction=bottom]:max-h-[92vh] data-[vaul-drawer-direction=bottom]:rounded-t-[1.75rem]"
      >
        <div className="mx-auto flex h-full w-full max-w-2xl flex-col overflow-hidden">
          <DrawerHeader className="border-b border-white/10 px-4 pb-4 pt-4 text-left md:px-6">
            <DrawerTitle className="text-left text-xl text-white">
              Update payment method
            </DrawerTitle>
            <DrawerDescription className="text-left text-sm leading-6 text-slate-400">
              {paymentMethodLabel} is currently unavailable for this withdrawal.
              Provide alternate payout details so processing can continue.
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6">
            {unavailableReason ? (
              <Alert className="mb-5 rounded-2xl border border-amber-400/20 bg-amber-500/10 text-amber-100">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="text-sm font-medium text-amber-50">
                  {unavailableReason}
                </AlertTitle>
              </Alert>
            ) : null}

            <Tabs
              value={methodType}
              onValueChange={(value) => setMethodType(value as MethodType)}
              className="space-y-5"
            >
              <TabsList className="h-auto w-full rounded-2xl border border-white/10 bg-white/[0.04] p-1">
                <TabsTrigger
                  value="WESTERN_UNION"
                  className="h-11 rounded-xl data-active:bg-white/10 data-active:text-white"
                >
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Western Union
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="CASH_DELIVERY"
                  className="h-11 rounded-xl data-active:bg-white/10 data-active:text-white"
                >
                  <div className="flex items-center gap-2">
                    <Landmark className="h-4 w-4" />
                    Cash delivery
                  </div>
                </TabsTrigger>
              </TabsList>

              <form action={formAction} className="space-y-5">
                <input type="hidden" name="withdrawalId" value={withdrawalId} />
                <input type="hidden" name="methodType" value={methodType} />

                {methodType === "WESTERN_UNION" ? (
                  <FieldGroup className="gap-5">
                    <Field data-invalid={Boolean(state.fieldErrors?.receiverName) || undefined}>
                      <FieldLabel className="text-slate-200">
                        Receiver name
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          name="receiverName"
                          placeholder="Full name of the receiver"
                          className="h-11 rounded-2xl border-white/10 bg-white/[0.03] text-white"
                        />
                        {state.fieldErrors?.receiverName ? (
                          <FieldError
                            errors={state.fieldErrors.receiverName.map((message) => ({
                              message,
                            }))}
                          />
                        ) : null}
                      </FieldContent>
                    </Field>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field data-invalid={Boolean(state.fieldErrors?.receiverCountry) || undefined}>
                        <FieldLabel className="text-slate-200">
                          Receiver country
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            name="receiverCountry"
                            placeholder="Country"
                            className="h-11 rounded-2xl border-white/10 bg-white/[0.03] text-white"
                          />
                          {state.fieldErrors?.receiverCountry ? (
                            <FieldError
                              errors={state.fieldErrors.receiverCountry.map((message) => ({
                                message,
                              }))}
                            />
                          ) : null}
                        </FieldContent>
                      </Field>

                      <Field data-invalid={Boolean(state.fieldErrors?.receiverCity) || undefined}>
                        <FieldLabel className="text-slate-200">
                          Receiver city
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            name="receiverCity"
                            placeholder="City"
                            className="h-11 rounded-2xl border-white/10 bg-white/[0.03] text-white"
                          />
                          {state.fieldErrors?.receiverCity ? (
                            <FieldError
                              errors={state.fieldErrors.receiverCity.map((message) => ({
                                message,
                              }))}
                            />
                          ) : null}
                        </FieldContent>
                      </Field>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field data-invalid={Boolean(state.fieldErrors?.receiverPhone) || undefined}>
                        <FieldLabel className="text-slate-200">
                          Receiver phone
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            name="receiverPhone"
                            inputMode="tel"
                            placeholder="Phone number"
                            className="h-11 rounded-2xl border-white/10 bg-white/[0.03] text-white"
                          />
                          {state.fieldErrors?.receiverPhone ? (
                            <FieldError
                              errors={state.fieldErrors.receiverPhone.map((message) => ({
                                message,
                              }))}
                            />
                          ) : null}
                        </FieldContent>
                      </Field>

                      <Field>
                        <FieldLabel className="text-slate-200">
                          Transfer reference
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            name="transferReference"
                            placeholder="Optional reference"
                            className="h-11 rounded-2xl border-white/10 bg-white/[0.03] text-white"
                          />
                        </FieldContent>
                      </Field>
                    </div>
                  </FieldGroup>
                ) : (
                  <FieldGroup className="gap-5">
                    <Field data-invalid={Boolean(state.fieldErrors?.recipientName) || undefined}>
                      <FieldLabel className="text-slate-200">
                        Recipient name
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          name="recipientName"
                          placeholder="Full name of the recipient"
                          className="h-11 rounded-2xl border-white/10 bg-white/[0.03] text-white"
                        />
                        {state.fieldErrors?.recipientName ? (
                          <FieldError
                            errors={state.fieldErrors.recipientName.map((message) => ({
                              message,
                            }))}
                          />
                        ) : null}
                      </FieldContent>
                    </Field>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field data-invalid={Boolean(state.fieldErrors?.deliveryCountry) || undefined}>
                        <FieldLabel className="text-slate-200">
                          Delivery country
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            name="deliveryCountry"
                            placeholder="Country"
                            className="h-11 rounded-2xl border-white/10 bg-white/[0.03] text-white"
                          />
                          {state.fieldErrors?.deliveryCountry ? (
                            <FieldError
                              errors={state.fieldErrors.deliveryCountry.map((message) => ({
                                message,
                              }))}
                            />
                          ) : null}
                        </FieldContent>
                      </Field>

                      <Field data-invalid={Boolean(state.fieldErrors?.deliveryCity) || undefined}>
                        <FieldLabel className="text-slate-200">
                          Delivery city
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            name="deliveryCity"
                            placeholder="City"
                            className="h-11 rounded-2xl border-white/10 bg-white/[0.03] text-white"
                          />
                          {state.fieldErrors?.deliveryCity ? (
                            <FieldError
                              errors={state.fieldErrors.deliveryCity.map((message) => ({
                                message,
                              }))}
                            />
                          ) : null}
                        </FieldContent>
                      </Field>
                    </div>

                    <Field data-invalid={Boolean(state.fieldErrors?.deliveryAddress) || undefined}>
                      <FieldLabel className="text-slate-200">
                        Delivery address
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          name="deliveryAddress"
                          placeholder="Street address or pickup location"
                          className="h-11 rounded-2xl border-white/10 bg-white/[0.03] text-white"
                        />
                        {state.fieldErrors?.deliveryAddress ? (
                          <FieldError
                            errors={state.fieldErrors.deliveryAddress.map((message) => ({
                              message,
                            }))}
                          />
                        ) : null}
                      </FieldContent>
                    </Field>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field data-invalid={Boolean(state.fieldErrors?.contactPhone) || undefined}>
                        <FieldLabel className="text-slate-200">
                          Contact phone
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            name="contactPhone"
                            inputMode="tel"
                            placeholder="Phone number"
                            className="h-11 rounded-2xl border-white/10 bg-white/[0.03] text-white"
                          />
                          {state.fieldErrors?.contactPhone ? (
                            <FieldError
                              errors={state.fieldErrors.contactPhone.map((message) => ({
                                message,
                              }))}
                            />
                          ) : null}
                        </FieldContent>
                      </Field>

                      <Field>
                        <FieldLabel className="text-slate-200">
                          Delivery instructions
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            name="deliveryInstructions"
                            placeholder="Optional instructions"
                            className="h-11 rounded-2xl border-white/10 bg-white/[0.03] text-white"
                          />
                        </FieldContent>
                      </Field>
                    </div>
                  </FieldGroup>
                )}

                <Field>
                  <FieldLabel className="text-slate-200">Notes</FieldLabel>
                  <FieldContent>
                    <Textarea
                      name="note"
                      rows={4}
                      placeholder="Optional note for the processing team"
                      className="rounded-2xl border-white/10 bg-white/[0.03] text-white placeholder:text-slate-500"
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

                {state.status === "error" && state.message ? (
                  <Alert className="rounded-2xl border border-red-400/20 bg-red-400/10 text-red-200">
                    <AlertTitle>{state.message}</AlertTitle>
                  </Alert>
                ) : null}

                <DrawerFooter className="border-t border-white/10 px-0 pt-4">
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                    <DrawerClose asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full rounded-2xl border-white/10 bg-transparent text-slate-200 sm:w-auto"
                      >
                        Cancel
                      </Button>
                    </DrawerClose>
                    <Button
                      type="submit"
                      disabled={pending}
                      className={cn(
                        "w-full rounded-2xl bg-[#3c9ee0] hover:bg-[#2f8bd0] sm:w-auto",
                      )}
                    >
                      {pending ? "Saving..." : "Update details"}
                    </Button>
                  </div>
                </DrawerFooter>
              </form>
            </Tabs>
          </div>
        </div>
      </DrawerSurface>
    </Drawer>
  );
}
