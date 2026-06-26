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
  DrawerContent,
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
    <DrawerContent className="z-[70] data-[vaul-drawer-direction=bottom]:max-h-[92vh] data-[vaul-drawer-direction=bottom]:rounded-t-[1.75rem]">
        <div className="mx-auto flex h-full w-full max-w-2xl flex-col overflow-hidden">
          <DrawerHeader className="border-b border-white/10 px-4 pb-4 pt-4 text-left md:px-6">
            <DrawerTitle className="text-left text-xl text-white">
              Add payment method
            </DrawerTitle>
            <DrawerDescription className="text-left text-sm leading-6 text-slate-400">
              Add a new payment method to your account
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6">
            <Tabs
              value={type}
              onValueChange={(value) => setType(value as "BANK" | "CRYPTO")}
              className="space-y-5"
            >
              <TabsList className="h-auto w-full rounded-2xl border border-white/8 bg-white/[0.03] p-1">
                <TabsTrigger
                  value="BANK"
                  className="h-11 rounded-xl data-active:bg-[#0d1a2c] data-active:text-white"
                >
                  <div className="flex items-center gap-2">
                    <Landmark className="h-4 w-4" />
                    Bank account
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="CRYPTO"
                  className="h-11 rounded-xl data-active:bg-[#0d1a2c] data-active:text-white"
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
                      data-invalid={
                        Boolean(bankState.fieldErrors?.bankName) || undefined
                      }
                    >
                      <FieldLabel className="text-slate-200">
                        Bank name
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          name="bankName"
                          placeholder="e.g. Chase Bank"
                          className="h-11 rounded-2xl border-white/10 bg-white/[0.03] text-white"
                        />
                        {bankState.fieldErrors?.bankName ? (
                          <FieldError
                            errors={bankState.fieldErrors.bankName.map(
                              (message) => ({
                                message,
                              }),
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
                      <FieldLabel className="text-slate-200">
                        Account name
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          name="accountName"
                          placeholder="Name on account"
                          className="h-11 rounded-2xl border-white/10 bg-white/[0.03] text-white"
                        />
                        {bankState.fieldErrors?.accountName ? (
                          <FieldError
                            errors={bankState.fieldErrors.accountName.map(
                              (message) => ({
                                message,
                              }),
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
                      <FieldLabel className="text-slate-200">
                        Account number
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          name="accountNumber"
                          inputMode="numeric"
                          placeholder="0123456789"
                          className="h-11 rounded-2xl border-white/10 bg-white/[0.03] text-white"
                        />
                        {bankState.fieldErrors?.accountNumber ? (
                          <FieldError
                            errors={bankState.fieldErrors.accountNumber.map(
                              (message) => ({
                                message,
                              }),
                            )}
                          />
                        ) : null}
                      </FieldContent>
                    </Field>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field>
                        <FieldLabel className="text-slate-200">
                          Bank code
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            name="bankCode"
                            placeholder="Sort code or bank code"
                            className="h-11 rounded-2xl border-white/10 bg-white/[0.03] text-white"
                          />
                        </FieldContent>
                      </Field>

                      <Field>
                        <FieldLabel className="text-slate-200">IBAN</FieldLabel>
                        <FieldContent>
                          <Input
                            name="iban"
                            placeholder="Optional IBAN"
                            className="h-11 rounded-2xl border-white/10 bg-white/[0.03] text-white"
                          />
                        </FieldContent>
                      </Field>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field>
                        <FieldLabel className="text-slate-200">
                          SWIFT / BIC
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            name="swiftCode"
                            placeholder="Optional SWIFT"
                            className="h-11 rounded-2xl border-white/10 bg-white/[0.03] text-white"
                          />
                        </FieldContent>
                      </Field>

                      <Field>
                        <FieldLabel className="text-slate-200">
                          Routing number
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            name="routingNumber"
                            placeholder="Optional routing number"
                            className="h-11 rounded-2xl border-white/10 bg-white/[0.03] text-white"
                          />
                        </FieldContent>
                      </Field>
                    </div>

                    <Field>
                      <FieldLabel className="text-slate-200">
                        Branch name
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          name="branchName"
                          placeholder="Optional branch location"
                          className="h-11 rounded-2xl border-white/10 bg-white/[0.03] text-white"
                        />
                      </FieldContent>
                    </Field>
                  </FieldGroup>

                  {bankState.status === "error" && bankState.message ? (
                    <Alert className="rounded-2xl border border-red-400/20 bg-red-400/10 text-red-200">
                      <AlertTitle>{bankState.message}</AlertTitle>
                    </Alert>
                  ) : null}

                  <DrawerFooter className="border-t border-white/10 px-0 pt-4">
                    <div className="flex items-center justify-end gap-3">
                      <DrawerClose asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-2xl border-white/10 bg-transparent text-slate-200"
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
                      <FieldLabel className="text-slate-200">
                        Network
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          name="network"
                          placeholder="e.g. BTC, ETH"
                          className="h-11 rounded-2xl border-white/10 bg-white/[0.03] text-white"
                        />
                        {cryptoState.fieldErrors?.network ? (
                          <FieldError
                            errors={cryptoState.fieldErrors.network.map(
                              (message) => ({
                                message,
                              }),
                            )}
                          />
                        ) : null}

                        <FieldDescription className="text-xs">
                          BTC and ETH Networks only!
                        </FieldDescription>
                      </FieldContent>
                    </Field>

                    <Field
                      data-invalid={
                        Boolean(cryptoState.fieldErrors?.address) || undefined
                      }
                    >
                      <FieldLabel className="text-slate-200">
                        Wallet address
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          name="address"
                          placeholder="Paste destination wallet address"
                          className="h-11 rounded-2xl border-white/10 bg-white/[0.03] font-mono text-white"
                        />
                        {cryptoState.fieldErrors?.address ? (
                          <FieldError
                            errors={cryptoState.fieldErrors.address.map(
                              (message) => ({
                                message,
                              }),
                            )}
                          />
                        ) : null}
                      </FieldContent>
                    </Field>
                  </FieldGroup>

                  {cryptoState.status === "error" && cryptoState.message ? (
                    <Alert className="rounded-2xl border border-red-400/20 bg-red-400/10 text-red-200">
                      <AlertTitle>{cryptoState.message}</AlertTitle>
                    </Alert>
                  ) : null}

                  <DrawerFooter className="border-t border-white/10 px-0 pt-4">
                    <div className="flex items-center justify-end gap-3">
                      <DrawerClose asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-2xl border-white/10 bg-transparent text-slate-200"
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
      </DrawerContent>
    </Drawer>
  );
}
