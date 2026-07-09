"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CreditCard, Landmark } from "lucide-react";

import { createPaymentMethod } from "@/actions/accounts/payments/createPaymentMethod";
import { Alert, AlertTitle } from "@/components/ui/alert";
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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createInitialFormState } from "@/lib/forms/actionState";
import { DrawerSurface } from "@/components/ui/drawer-surface";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const initialCreatePaymentMethodState = createInitialFormState<
  | "type"
  | "bankName"
  | "accountName"
  | "accountNumber"
  | "bankCode"
  | "iban"
  | "swiftCode"
  | "routingNumber"
  | "branchName"
  | "network"
  | "address"
>();

const inputClassName =
  "h-11 rounded-2xl border-border/60 bg-white/95 text-slate-950 placeholder:text-slate-400 focus-visible:ring-sky-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500";

export default function PaymentMethodDrawer({ open, onOpenChange }: Props) {
  const router = useRouter();
  const [type, setType] = useState<"BANK" | "CRYPTO">("BANK");
  const [bankState, bankFormAction, bankPending] = useActionState(
    createPaymentMethod,
    initialCreatePaymentMethodState,
  );
  const [cryptoState, cryptoFormAction, cryptoPending] = useActionState(
    createPaymentMethod,
    initialCreatePaymentMethodState,
  );

  const formAction = type === "BANK" ? bankFormAction : cryptoFormAction;

  useEffect(() => {
    if (bankState.status === "success" || cryptoState.status === "success") {
      onOpenChange(false);
      router.refresh();
    }
  }, [bankState.status, cryptoState.status, onOpenChange, router]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setType("BANK");
    }

    onOpenChange(nextOpen);
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerSurface
        tone="light"
        className="overflow-hidden data-[vaul-drawer-direction=bottom]:max-h-[92vh] data-[vaul-drawer-direction=bottom]:rounded-t-[1.75rem]"
      >
        <div className="mx-auto flex h-full w-full max-w-2xl flex-col overflow-hidden">
          <DrawerHeader className="border-b border-border/60 px-4 pb-4 pt-4 text-left md:px-6 dark:border-white/10">
            <DrawerTitle className="text-left text-xl tracking-[-0.03em] text-slate-950 dark:text-white">
              Add payment method
            </DrawerTitle>
            <DrawerDescription className="text-left text-sm leading-6 text-slate-600 dark:text-slate-400">
              Add a new payment method to your account.
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6">
            <Tabs
              value={type}
              onValueChange={(value) => setType(value as "BANK" | "CRYPTO")}
              className="space-y-5"
            >
              <TabsList className="h-auto w-full rounded-2xl border border-border/60 bg-slate-50 p-1 dark:border-white/10 dark:bg-white/[0.04]">
                <TabsTrigger
                  value="BANK"
                  className="h-11 rounded-xl text-slate-600 transition-colors hover:text-slate-900 data-active:bg-sky-50 data-active:text-sky-800 dark:text-slate-300 dark:hover:text-white dark:data-active:bg-white/10 dark:data-active:text-white"
                >
                  <div className="flex items-center gap-2">
                    <Landmark className="h-4 w-4" />
                    Bank account
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="CRYPTO"
                  className="h-11 rounded-xl text-slate-600 transition-colors hover:text-slate-900 data-active:bg-sky-50 data-active:text-sky-800 dark:text-slate-300 dark:hover:text-white dark:data-active:bg-white/10 dark:data-active:text-white"
                >
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Crypto wallet
                  </div>
                </TabsTrigger>
              </TabsList>

              {type === "BANK" ? (
                <form action={formAction} className="space-y-5">
                  <input type="hidden" name="type" value="BANK" />

                  <FieldGroup className="gap-5">
                    <Field
                      data-invalid={Boolean(bankState.fieldErrors?.bankName) || undefined}
                    >
                      <FieldLabel className="text-slate-600 dark:text-slate-300">
                        Bank name
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          name="bankName"
                          placeholder="e.g. Chase Bank"
                          className={inputClassName}
                        />
                        {bankState.fieldErrors?.bankName ? (
                          <FieldError
                            errors={bankState.fieldErrors.bankName.map((message) => ({
                              message,
                            }))}
                          />
                        ) : null}
                      </FieldContent>
                    </Field>

                    <Field
                      data-invalid={Boolean(bankState.fieldErrors?.accountName) || undefined}
                    >
                      <FieldLabel className="text-slate-600 dark:text-slate-300">
                        Account name
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          name="accountName"
                          placeholder="Name on account"
                          className={inputClassName}
                        />
                        {bankState.fieldErrors?.accountName ? (
                          <FieldError
                            errors={bankState.fieldErrors.accountName.map((message) => ({
                              message,
                            }))}
                          />
                        ) : null}
                      </FieldContent>
                    </Field>

                    <Field
                      data-invalid={
                        Boolean(bankState.fieldErrors?.accountNumber) || undefined
                      }
                    >
                      <FieldLabel className="text-slate-600 dark:text-slate-300">
                        Account number
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          name="accountNumber"
                          inputMode="numeric"
                          placeholder="0123456789"
                          className={inputClassName}
                        />
                        {bankState.fieldErrors?.accountNumber ? (
                          <FieldError
                            errors={bankState.fieldErrors.accountNumber.map((message) => ({
                              message,
                            }))}
                          />
                        ) : null}
                      </FieldContent>
                    </Field>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field>
                        <FieldLabel className="text-slate-600 dark:text-slate-300">
                          Bank code
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            name="bankCode"
                            placeholder="Sort code or bank code"
                            className={inputClassName}
                          />
                        </FieldContent>
                      </Field>

                      <Field>
                        <FieldLabel className="text-slate-600 dark:text-slate-300">
                          IBAN
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            name="iban"
                            placeholder="Optional IBAN"
                            className={inputClassName}
                          />
                        </FieldContent>
                      </Field>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field>
                        <FieldLabel className="text-slate-600 dark:text-slate-300">
                          SWIFT / BIC
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            name="swiftCode"
                            placeholder="Optional SWIFT"
                            className={inputClassName}
                          />
                        </FieldContent>
                      </Field>

                      <Field>
                        <FieldLabel className="text-slate-600 dark:text-slate-300">
                          Routing number
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            name="routingNumber"
                            placeholder="Optional routing number"
                            className={inputClassName}
                          />
                        </FieldContent>
                      </Field>
                    </div>

                    <Field>
                      <FieldLabel className="text-slate-600 dark:text-slate-300">
                        Branch name
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          name="branchName"
                          placeholder="Optional branch location"
                          className={inputClassName}
                        />
                      </FieldContent>
                    </Field>
                  </FieldGroup>

                  {bankState.status === "error" && bankState.message ? (
                    <Alert className="rounded-2xl border border-red-200/70 bg-red-50 text-red-900 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-200">
                      <AlertTitle>{bankState.message}</AlertTitle>
                    </Alert>
                  ) : null}

                  <DrawerFooter className="border-t border-border/60 px-0 pt-4 dark:border-white/10">
                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                      <DrawerClose asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-2xl border-border/60 bg-white/80 text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100 dark:hover:bg-white/[0.08]"
                        >
                          Cancel
                        </Button>
                      </DrawerClose>
                      <Button
                        type="submit"
                        disabled={bankPending}
                        className="rounded-2xl bg-[#3c9ee0] hover:bg-[#2f8bd0]"
                      >
                        {bankPending ? "Saving..." : "Save bank account"}
                      </Button>
                    </div>
                  </DrawerFooter>
                </form>
              ) : (
                <form action={formAction} className="space-y-5">
                  <input type="hidden" name="type" value="CRYPTO" />

                  <FieldGroup className="gap-5">
                    <Field
                      data-invalid={
                        Boolean(cryptoState.fieldErrors?.network) || undefined
                      }
                    >
                      <FieldLabel className="text-slate-600 dark:text-slate-300">
                        Network
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          name="network"
                          placeholder="e.g. BTC, ETH"
                          className={inputClassName}
                        />
                        {cryptoState.fieldErrors?.network ? (
                          <FieldError
                            errors={cryptoState.fieldErrors.network.map((message) => ({
                              message,
                            }))}
                          />
                        ) : null}

                        <FieldDescription className="text-xs text-slate-500 dark:text-slate-400">
                          BTC and ETH Networks only!
                        </FieldDescription>
                      </FieldContent>
                    </Field>

                    <Field
                      data-invalid={
                        Boolean(cryptoState.fieldErrors?.address) || undefined
                      }
                    >
                      <FieldLabel className="text-slate-600 dark:text-slate-300">
                        Wallet address
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          name="address"
                          placeholder="Paste destination wallet address"
                          className={`${inputClassName} font-mono`}
                        />
                        {cryptoState.fieldErrors?.address ? (
                          <FieldError
                            errors={cryptoState.fieldErrors.address.map((message) => ({
                              message,
                            }))}
                          />
                        ) : null}
                      </FieldContent>
                    </Field>
                  </FieldGroup>

                  {cryptoState.status === "error" && cryptoState.message ? (
                    <Alert className="rounded-2xl border border-red-200/70 bg-red-50 text-red-900 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-200">
                      <AlertTitle>{cryptoState.message}</AlertTitle>
                    </Alert>
                  ) : null}

                  <DrawerFooter className="border-t border-border/60 px-0 pt-4 dark:border-white/10">
                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                      <DrawerClose asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-2xl border-border/60 bg-white/80 text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100 dark:hover:bg-white/[0.08]"
                        >
                          Cancel
                        </Button>
                      </DrawerClose>
                      <Button
                        type="submit"
                        disabled={cryptoPending}
                        className="rounded-2xl bg-[#3c9ee0] hover:bg-[#2f8bd0]"
                      >
                        {cryptoPending ? "Saving..." : "Save crypto wallet"}
                      </Button>
                    </div>
                  </DrawerFooter>
                </form>
              )}
            </Tabs>
          </div>
        </div>
      </DrawerSurface>
    </Drawer>
  );
}
