"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { CreditCard, Landmark, ShieldCheck, Wallet } from "lucide-react";

import { createPaymentMethod } from "@/actions/accounts/payments/createPaymentMethod";
import { Alert, AlertTitle } from "@/components/ui/alert";
import {
  Drawer,
  DrawerClose,
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
  "h-11 rounded-xl border-slate-300 bg-white text-slate-950 placeholder:text-slate-500 shadow-sm focus-visible:border-sky-600 focus-visible:ring-sky-600/20 dark:border-white/15 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-400";

const labelClassName =
  "text-sm font-semibold text-slate-800 dark:text-slate-200";

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
        className="overflow-hidden border-t border-slate-200 bg-white data-[vaul-drawer-direction=bottom]:max-h-[92vh] data-[vaul-drawer-direction=bottom]:rounded-t-[1.75rem] dark:border-white/10 dark:bg-slate-950"
      >
        <div className="mx-auto flex h-full w-full max-w-2xl flex-col overflow-hidden">
          <DrawerHeader className="border-b border-slate-200 px-4 pb-4 pt-5 text-left md:px-6 dark:border-white/10">
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300">
              <Wallet className="h-5 w-5" />
            </div>

            <DrawerTitle className="text-left text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
              Add payment method
            </DrawerTitle>

            <p className="max-w-lg text-sm leading-6 text-slate-700 dark:text-slate-300">
              Add a bank account or crypto wallet to receive your withdrawals.
            </p>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-4 py-5 md:px-6">
            <Tabs
              value={type}
              onValueChange={(value) => setType(value as "BANK" | "CRYPTO")}
              className="space-y-6"
            >
              <TabsList className="grid h-auto w-full grid-cols-2 rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-white/10 dark:bg-white/[0.05]">
                <TabsTrigger
                  value="BANK"
                  className="h-11 rounded-lg font-semibold text-slate-700 transition-colors hover:text-slate-950 data-active:bg-white data-active:text-sky-900 data-active:shadow-sm dark:text-slate-300 dark:hover:text-white dark:data-active:bg-white/10 dark:data-active:text-sky-200"
                >
                  <div className="flex items-center gap-2">
                    <Landmark className="h-4 w-4" />
                    Bank account
                  </div>
                </TabsTrigger>

                <TabsTrigger
                  value="CRYPTO"
                  className="h-11 rounded-lg font-semibold text-slate-700 transition-colors hover:text-slate-950 data-active:bg-white data-active:text-sky-900 data-active:shadow-sm dark:text-slate-300 dark:hover:text-white dark:data-active:bg-white/10 dark:data-active:text-sky-200"
                >
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Crypto wallet
                  </div>
                </TabsTrigger>
              </TabsList>

              {type === "BANK" ? (
                <form action={formAction} className="space-y-6">
                  <input type="hidden" name="type" value="BANK" />

                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
                      Bank account details
                    </h3>
                    <p className="text-xs leading-5 text-slate-600 dark:text-slate-400">
                      Enter the account details you want to use for withdrawals.
                    </p>
                  </div>

                  <FieldGroup className="gap-5">
                    <Field
                      data-invalid={
                        Boolean(bankState.fieldErrors?.bankName) || undefined
                      }
                    >
                      <FieldLabel className={labelClassName}>
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
                            errors={bankState.fieldErrors.bankName.map(
                              (message) => ({ message }),
                            )}
                          />
                        ) : null}
                      </FieldContent>
                    </Field>

                    <Field
                      data-invalid={
                        Boolean(bankState.fieldErrors?.accountName) || undefined
                      }
                    >
                      <FieldLabel className={labelClassName}>
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
                            errors={bankState.fieldErrors.accountName.map(
                              (message) => ({ message }),
                            )}
                          />
                        ) : null}
                      </FieldContent>
                    </Field>

                    <Field
                      data-invalid={
                        Boolean(bankState.fieldErrors?.accountNumber) ||
                        undefined
                      }
                    >
                      <FieldLabel className={labelClassName}>
                        Account number
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          name="accountNumber"
                          inputMode="numeric"
                          placeholder="0123456789"
                          className={`${inputClassName} font-mono`}
                        />
                        {bankState.fieldErrors?.accountNumber ? (
                          <FieldError
                            errors={bankState.fieldErrors.accountNumber.map(
                              (message) => ({ message }),
                            )}
                          />
                        ) : null}
                      </FieldContent>
                    </Field>

                    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                          Additional bank details
                        </h4>
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                          Optional information for supported bank transfers.
                        </p>
                      </div>

                      <FieldGroup className="gap-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field>
                            <FieldLabel className={labelClassName}>
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
                            <FieldLabel className={labelClassName}>
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

                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field>
                            <FieldLabel className={labelClassName}>
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
                            <FieldLabel className={labelClassName}>
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
                          <FieldLabel className={labelClassName}>
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
                    </div>
                  </FieldGroup>

                  {bankState.status === "error" && bankState.message ? (
                    <Alert className="rounded-xl border border-red-200 bg-red-50 text-red-950 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-200">
                      <AlertTitle className="font-semibold">
                        {bankState.message}
                      </AlertTitle>
                    </Alert>
                  ) : null}

                  <DrawerFooter className="border-t border-slate-200 px-0 pt-5 dark:border-white/10">
                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                      <DrawerClose asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-11 rounded-xl border-slate-300 bg-white font-semibold text-slate-800 hover:bg-slate-100 dark:border-white/15 dark:bg-white/[0.04] dark:text-slate-100 dark:hover:bg-white/[0.08]"
                        >
                          Cancel
                        </Button>
                      </DrawerClose>

                      <Button
                        type="submit"
                        disabled={bankPending}
                        className="h-11 rounded-xl bg-[#3c9ee0] font-semibold text-white hover:bg-[#2f8bd0]"
                      >
                        {bankPending ? "Saving..." : "Save bank account"}
                      </Button>
                    </div>
                  </DrawerFooter>
                </form>
              ) : (
                <form action={formAction} className="space-y-6">
                  <input type="hidden" name="type" value="CRYPTO" />

                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
                      Crypto wallet details
                    </h3>
                    <p className="text-xs leading-5 text-slate-600 dark:text-slate-400">
                      Add the wallet address you want to use for supported
                      crypto withdrawals.
                    </p>
                  </div>

                  <FieldGroup className="gap-5">
                    <Field
                      data-invalid={
                        Boolean(cryptoState.fieldErrors?.network) || undefined
                      }
                    >
                      <FieldLabel className={labelClassName}>
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
                            errors={cryptoState.fieldErrors.network.map(
                              (message) => ({ message }),
                            )}
                          />
                        ) : null}

                        <FieldDescription className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          BTC and ETH Networks only!
                        </FieldDescription>
                      </FieldContent>
                    </Field>

                    <Field
                      data-invalid={
                        Boolean(cryptoState.fieldErrors?.address) || undefined
                      }
                    >
                      <FieldLabel className={labelClassName}>
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
                            errors={cryptoState.fieldErrors.address.map(
                              (message) => ({ message }),
                            )}
                          />
                        ) : null}
                      </FieldContent>
                    </Field>
                  </FieldGroup>

                  <div className="flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-400/20 dark:bg-sky-400/[0.06]">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-sky-800 dark:text-sky-300" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-sky-950 dark:text-sky-200">
                        Verify your wallet details
                      </p>
                      <p className="text-xs leading-5 text-sky-900 dark:text-sky-100">
                        Make sure the wallet address matches the selected
                        network before saving it.
                      </p>
                    </div>
                  </div>

                  {cryptoState.status === "error" && cryptoState.message ? (
                    <Alert className="rounded-xl border border-red-200 bg-red-50 text-red-950 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-200">
                      <AlertTitle className="font-semibold">
                        {cryptoState.message}
                      </AlertTitle>
                    </Alert>
                  ) : null}

                  <DrawerFooter className="border-t border-slate-200 px-0 pt-5 dark:border-white/10">
                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                      <DrawerClose asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-11 rounded-xl border-slate-300 bg-white font-semibold text-slate-800 hover:bg-slate-100 dark:border-white/15 dark:bg-white/[0.04] dark:text-slate-100 dark:hover:bg-white/[0.08]"
                        >
                          Cancel
                        </Button>
                      </DrawerClose>

                      <Button
                        type="submit"
                        disabled={cryptoPending}
                        className="h-11 rounded-xl bg-[#3c9ee0] font-semibold text-white hover:bg-[#2f8bd0]"
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
