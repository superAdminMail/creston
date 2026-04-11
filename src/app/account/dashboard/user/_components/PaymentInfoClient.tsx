"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import {
  Loader2,
  CreditCard,
  Landmark,
  Plus,
  ShieldCheck,
  Star,
  Trash2,
  WalletCards,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  createPaymentMethod,
} from "@/actions/accounts/payments/createPaymentMethod";
import { deletePaymentMethod } from "@/actions/accounts/payments/deletePaymentMethod";
import { setDefaultPaymentMethod } from "@/actions/accounts/payments/setDefaultPaymentMethod";
import { Alert, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createInitialFormState } from "@/lib/forms/actionState";

type PaymentMethod = {
  id: string;
  type: "BANK" | "CRYPTO";
  isDefault: boolean;
  bankName?: string | null;
  accountName?: string | null;
  accountNumber?: string | null;
  network?: string | null;
  address?: string | null;
};

type Props = {
  initialMethods: PaymentMethod[];
  kycStatus: "NOT_STARTED" | "VERIFIED" | "PENDING_REVIEW" | "REJECTED";
};

const initialCreatePaymentMethodState = createInitialFormState<
  "type" | "bankName" | "accountName" | "accountNumber" | "network" | "address"
>();

function maskSensitiveValue(value?: string | null) {
  if (!value) {
    return "Not provided";
  }

  if (value.length <= 7) {
    return `${value.slice(0, 1)}***${value.slice(-1)}`;
  }

  return `${value.slice(0, 4)}***${value.slice(-3)}`;
}

function PaymentMethodCard({
  method,
  onSetDefault,
  onRemove,
}: {
  method: PaymentMethod;
  onSetDefault: (id: string) => void;
  onRemove: (id: string, wasDefault: boolean) => void;
}) {
  const router = useRouter();
  const [isRemoving, startRemoving] = useTransition();
  const [removeOpen, setRemoveOpen] = useState(false);

  const handleRemove = () => {
    startRemoving(async () => {
      const result = await deletePaymentMethod(method.id);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      onRemove(method.id, method.isDefault);
      setRemoveOpen(false);
      toast.success("Payment method removed.");
      router.refresh();
    });
  };

  return (
    <div className="relative rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl transition hover:border-white/20">
      <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[#3c9ee0]/20 blur-3xl" />

      {method.isDefault && (
        <span className="absolute top-4 right-4 rounded-full border border-[#3c9ee0]/20 bg-[#3c9ee0]/10 px-2 py-1 text-[10px] text-[#3c9ee0]">
          Default
        </span>
      )}

      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-2">
          {method.type === "BANK" ? (
            <Landmark className="h-5 w-5 text-white" />
          ) : (
            <CreditCard className="h-5 w-5 text-white" />
          )}
        </div>

        <div>
          <p className="font-medium text-white">
            {method.type === "BANK" ? method.bankName : "Crypto Wallet"}
          </p>
          <p className="text-xs text-slate-400">
            {method.type === "BANK" ? "Bank Account" : method.network}
          </p>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {method.type === "BANK" ? (
          <>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Account Name</span>
              <span className="text-right text-white">
                {method.accountName}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Account Number</span>
              <span className="font-mono text-right text-white">
                {maskSensitiveValue(method.accountNumber)}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Network</span>
              <span className="text-right text-white">
                {method.network}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Address</span>
              <span className="max-w-[14rem] truncate font-mono text-right text-white">
                {maskSensitiveValue(method.address)}
              </span>
            </div>
          </>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 text-xs text-emerald-400">
          <ShieldCheck className="h-4 w-4" />
          Secure
        </div>

        <div className="flex items-center gap-3">
          {!method.isDefault && (
            <form action={setDefaultPaymentMethod}>
              <input type="hidden" name="id" value={method.id} />
              <button
                onClick={() => onSetDefault(method.id)}
                className="flex items-center gap-1 text-xs text-[#3c9ee0] hover:underline"
              >
                <Star className="h-4 w-4" />
                Set Default
              </button>
            </form>
          )}

          <AlertDialog open={removeOpen} onOpenChange={setRemoveOpen}>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1 text-xs text-red-300 hover:text-red-200"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove payment method?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove this {method.type === "BANK" ? "bank account" : "crypto wallet"} from your withdrawal options.
                </AlertDialogDescription>
              </AlertDialogHeader>

              {isRemoving ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Removing payment method...
                </div>
              ) : null}

              <AlertDialogFooter>
                <AlertDialogCancel disabled={isRemoving}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={(event) => {
                    event.preventDefault();
                    handleRemove();
                  }}
                  disabled={isRemoving}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  Remove method
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}

function PaymentMethodModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
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

  useEffect(() => {
    if (!open) {
      setType("BANK");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-[1.75rem] border border-white/10 bg-[#050b17] p-0 text-white ring-white/10">
        <div className="space-y-6 p-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl text-white">
              Add payment method
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-slate-400">
              Add a bank account or crypto wallet for withdrawals and funding.
            </DialogDescription>
          </DialogHeader>

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
              <form
                action={formAction}
                className="space-y-5"
              >
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
                      Boolean(bankState.fieldErrors?.accountNumber) || undefined
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
                </FieldGroup>

                {bankState.status === "error" && bankState.message ? (
                  <Alert className="rounded-2xl border border-red-400/20 bg-red-400/10 text-red-200">
                    <AlertTitle>{bankState.message}</AlertTitle>
                  </Alert>
                ) : null}

                <div className="flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-2xl border-white/10 bg-transparent text-slate-200"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={bankPending}
                    className="rounded-2xl bg-[#3c9ee0] hover:bg-[#2f8bd0]"
                  >
                    {bankPending ? "Saving..." : "Save bank account"}
                  </Button>
                </div>
              </form>
            ) : (
              <form
                action={formAction}
                className="space-y-5"
              >
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

                <div className="flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-2xl border-white/10 bg-transparent text-slate-200"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={cryptoPending}
                    className="rounded-2xl bg-[#3c9ee0] hover:bg-[#2f8bd0]"
                  >
                    {cryptoPending ? "Saving..." : "Save crypto wallet"}
                  </Button>
                </div>
              </form>
            )}
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function PaymentInfoClient({
  initialMethods,
  kycStatus,
}: Props) {
  const [paymentMethods, setPaymentMethods] = useState(initialMethods);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setPaymentMethods(initialMethods);
  }, [initialMethods]);

  const canManageMethods = kycStatus === "VERIFIED";

  const kycNotice = useMemo(() => {
    switch (kycStatus) {
      case "NOT_STARTED":
        return (
          <div className="rounded-2xl border border-yellow-400/20 bg-yellow-500/5 p-4 text-sm text-yellow-400">
            Complete{" "}
            <Link href="/account/dashboard/user/kyc" className="underline">
              Identity Verification
            </Link>{" "}
            to enable withdrawals and add payment methods.
          </div>
        );
      case "PENDING_REVIEW":
        return (
          <div className="rounded-2xl border border-yellow-400/20 bg-yellow-500/5 p-4 text-sm text-yellow-400">
            Verification in progress. Payment methods will unlock after review.
          </div>
        );
      case "REJECTED":
        return (
          <div className="rounded-2xl border border-yellow-400/20 bg-yellow-500/5 p-4 text-sm text-yellow-400">
            Verification failed. Update your KYC details to add payment methods.
          </div>
        );
      default:
        return null;
    }
  }, [kycStatus]);

  const handleLocalDefault = (id: string) => {
    setPaymentMethods((prev) =>
      prev.map((method) => ({
        ...method,
        isDefault: method.id === id,
      })),
    );
  };

  const handleLocalRemove = (id: string, wasDefault: boolean) => {
    setPaymentMethods((prev) => {
      const remaining = prev.filter((method) => method.id !== id);

      if (!wasDefault || remaining.length === 0) {
        return remaining;
      }

      return remaining.map((method, index) => ({
        ...method,
        isDefault: index === 0,
      }));
    });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Payment Methods</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage your withdrawal methods
          </p>
        </div>

        <Button
          onClick={() => setShowModal(true)}
          disabled={!canManageMethods}
          className="gap-2 rounded-xl bg-[#3c9ee0] hover:bg-[#2f8bd0]"
        >
          <Plus className="h-4 w-4" />
          Add Method
        </Button>
      </div>

      {kycNotice}

      {paymentMethods.length ? (
        <div className="grid gap-6 md:grid-cols-2">
          {paymentMethods.map((method) => (
            <PaymentMethodCard
              key={method.id}
              method={method}
              onSetDefault={handleLocalDefault}
              onRemove={handleLocalRemove}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-8 text-center shadow-xl backdrop-blur-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#3c9ee0]/20 bg-[#3c9ee0]/10">
            <WalletCards className="h-6 w-6 text-[#3c9ee0]" />
          </div>
          <h2 className="mt-5 text-lg font-semibold text-white">
            No payment method added yet
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-7 text-slate-400">
            Add a verified bank account or crypto wallet to receive withdrawals
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {canManageMethods ? (
              <Button
                onClick={() => setShowModal(true)}
                className="gap-2 rounded-xl bg-[#3c9ee0] hover:bg-[#2f8bd0]"
              >
                <Plus className="h-4 w-4" />
                Add Payment Method
              </Button>
            ) : (
              <Button
                asChild
                className="gap-2 rounded-xl bg-[#3c9ee0] hover:bg-[#2f8bd0]"
              >
                <Link href="/account/dashboard/user/kyc">
                  <ShieldCheck className="h-4 w-4" />
                  Complete Verification
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}

      {canManageMethods ? (
        <PaymentMethodModal open={showModal} onOpenChange={setShowModal} />
      ) : null}
    </div>
  );
}
