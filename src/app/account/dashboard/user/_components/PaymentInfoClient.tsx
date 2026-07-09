"use client";

import Link from "next/link";
import {
  useActionState,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
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

import { createPaymentMethod } from "@/actions/accounts/payments/createPaymentMethod";
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
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createInitialFormState } from "@/lib/forms/actionState";
import {
  DASHBOARD_PAGE_SURFACE_CLASS,
} from "../../_components/dashboardSurfaces";
import { cn } from "@/lib/utils";
import PaymentMethodDrawer from "./PaymentMethodDrawer";

type PaymentMethod = {
  id: string;
  type: "BANK" | "CRYPTO";
  isDefault: boolean;
  bankName?: string | null;
  accountName?: string | null;
  accountNumber?: string | null;
  bankCode?: string | null;
  iban?: string | null;
  swiftCode?: string | null;
  routingNumber?: string | null;
  branchName?: string | null;
  network?: string | null;
  address?: string | null;
};

type Props = {
  initialMethods: PaymentMethod[];
  kycStatus: "NOT_STARTED" | "VERIFIED" | "PENDING_REVIEW" | "REJECTED";
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
  const isBank = method.type === "BANK";

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
    <div
      className={cn(
        DASHBOARD_PAGE_SURFACE_CLASS,
        "relative overflow-hidden p-5 transition-colors hover:border-sky-300/60 hover:bg-sky-50/60 dark:hover:bg-white/[0.05] sm:p-6",
      )}
    >
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-sky-200/20 blur-3xl dark:bg-sky-400/10" />

      {method.isDefault && (
        <span className="absolute right-4 top-4 rounded-full border border-sky-200/70 bg-sky-50 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-sky-800 shadow-sm dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-100">
          Default
        </span>
      )}

      <div className="mb-5 flex flex-col gap-3 pr-20 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-sky-200/70 bg-sky-50 shadow-sm dark:border-sky-400/20 dark:bg-sky-400/10">
            {isBank ? (
              <Landmark className="h-5 w-5 text-sky-700 dark:text-sky-300" />
            ) : (
              <CreditCard className="h-5 w-5 text-sky-700 dark:text-sky-300" />
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate font-medium text-slate-950 dark:text-white">
              {isBank ? method.bankName : "Crypto Wallet"}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {isBank ? "Bank account" : method.network}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        {isBank ? (
          <>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <span className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Account Name
              </span>
              <span className="break-words text-right text-slate-950 dark:text-white">
                {method.accountName}
              </span>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <span className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Account Number
              </span>
              <span className="break-words font-mono text-right text-slate-950 dark:text-white">
                {maskSensitiveValue(method.accountNumber)}
              </span>
            </div>
            {method.bankCode ||
            method.iban ||
            method.swiftCode ||
            method.routingNumber ||
            method.branchName ? (
              <div className="mt-4 grid gap-3 rounded-2xl border border-border/60 bg-white/75 p-4 text-xs shadow-sm sm:grid-cols-2 dark:border-white/10 dark:bg-white/[0.04]">
                {method.bankCode ? (
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                      Bank code
                    </p>
                    <p className="break-words text-slate-800 dark:text-slate-100">
                      {method.bankCode}
                    </p>
                  </div>
                ) : null}
                {method.iban ? (
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                      IBAN
                    </p>
                    <p className="break-words font-mono text-slate-800 dark:text-slate-100">
                      {method.iban}
                    </p>
                  </div>
                ) : null}
                {method.swiftCode ? (
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                      SWIFT / BIC
                    </p>
                    <p className="break-words font-mono text-slate-800 dark:text-slate-100">
                      {method.swiftCode}
                    </p>
                  </div>
                ) : null}
                {method.routingNumber ? (
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                      Routing number
                    </p>
                    <p className="break-words font-mono text-slate-800 dark:text-slate-100">
                      {method.routingNumber}
                    </p>
                  </div>
                ) : null}
                {method.branchName ? (
                  <div className="space-y-1 sm:col-span-2">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                      Branch name
                    </p>
                    <p className="break-words text-slate-800 dark:text-slate-100">
                      {method.branchName}
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}
          </>
        ) : (
          <>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <span className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Network
              </span>
              <span className="break-words text-right text-slate-950 dark:text-white">
                {method.network}
              </span>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <span className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Address
              </span>
              <span className="max-w-full break-words font-mono text-right text-slate-950 dark:text-white sm:max-w-[14rem]">
                {maskSensitiveValue(method.address)}
              </span>
            </div>
          </>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
          <ShieldCheck className="h-4 w-4" />
          Secure
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!method.isDefault && (
            <form action={setDefaultPaymentMethod}>
              <input type="hidden" name="id" value={method.id} />
              <button
                onClick={() => onSetDefault(method.id)}
                className="inline-flex items-center gap-1.5 rounded-full border border-sky-200/70 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-800 transition hover:bg-sky-100 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-100 dark:hover:bg-sky-400/15"
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
                className="inline-flex items-center gap-1.5 rounded-full border border-rose-200/70 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-100 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-100 dark:hover:bg-rose-500/15"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove payment method?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove this{" "}
                  {method.type === "BANK" ? "bank account" : "crypto wallet"}{" "}
                  from your withdrawal options.
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

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setType("BANK");
    }

    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-hidden rounded-[1.75rem] border border-white/10 p-0 text-white ring-white/10 sm:max-w-xl">
        <div className="max-h-[calc(100vh-2rem)] overflow-y-auto space-y-6 p-6">
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
                          placeholder="International bank account number"
                          className="h-11 rounded-2xl border-white/10 bg-white/[0.03] text-white"
                        />
                      </FieldContent>
                    </Field>

                    <Field>
                      <FieldLabel className="text-slate-200">
                        SWIFT / BIC
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          name="swiftCode"
                          placeholder="Bank identifier code"
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
                          placeholder="For wire transfers"
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
              <form action={formAction} className="space-y-5">
                <input type="hidden" name="type" value="CRYPTO" />

                <FieldGroup className="gap-5">
                  <Field
                    data-invalid={
                      Boolean(cryptoState.fieldErrors?.network) || undefined
                    }
                  >
                    <FieldLabel className="text-slate-200">Network</FieldLabel>
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

  const canManageMethods = kycStatus === "VERIFIED";

  const kycNotice = useMemo(() => {
    switch (kycStatus) {
      case "NOT_STARTED":
        return (
          <div className="rounded-2xl border border-yellow-200/70 bg-yellow-50 p-4 text-sm text-yellow-800 shadow-sm dark:border-yellow-400/20 dark:bg-yellow-500/5 dark:text-yellow-300">
            Complete your KYC to enable withdrawals and add payment methods.
          </div>
        );
      case "PENDING_REVIEW":
        return (
          <div className="rounded-2xl border border-yellow-200/70 bg-yellow-50 p-4 text-sm text-yellow-800 shadow-sm dark:border-yellow-400/20 dark:bg-yellow-500/5 dark:text-yellow-300">
            Verification in progress. Payment methods will unlock after review.
          </div>
        );
      case "REJECTED":
        return (
          <div className="rounded-2xl border border-yellow-200/70 bg-yellow-50 p-4 text-sm text-yellow-800 shadow-sm dark:border-yellow-400/20 dark:bg-yellow-500/5 dark:text-yellow-300">
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
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-4 sm:px-6 sm:py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <p className="text-xs uppercase tracking-[0.24em] text-sky-700 dark:text-sky-300">
            Payment info
          </p>
          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
            Payment Methods
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Manage your withdrawal methods
          </p>
        </div>

        <Button
          onClick={() => setShowModal(true)}
          disabled={!canManageMethods}
          className="h-11 gap-2 rounded-2xl bg-[#3c9ee0] px-4 shadow-sm hover:bg-[#2f8bd0]"
        >
          <Plus className="h-4 w-4" />
          Add Method
        </Button>
      </div>

      {kycNotice}

      {paymentMethods.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
        <div className={`${DASHBOARD_PAGE_SURFACE_CLASS} rounded-[1.75rem] p-8 text-center shadow-sm`}>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-200/70 bg-sky-50 shadow-sm dark:border-sky-400/20 dark:bg-sky-400/10">
            <WalletCards className="h-6 w-6 text-sky-700 dark:text-sky-300" />
          </div>
          <h2 className="mt-5 text-lg font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
            No payment method added yet
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
            Add a verified bank account or crypto wallet to receive withdrawals
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {canManageMethods ? (
              <Button
                onClick={() => setShowModal(true)}
                className="h-11 gap-2 rounded-2xl bg-[#3c9ee0] px-5 shadow-sm hover:bg-[#2f8bd0]"
              >
                <Plus className="h-4 w-4" />
                Add Payment Method
              </Button>
            ) : (
              <Button
                asChild
                className="h-11 gap-2 rounded-2xl bg-[#3c9ee0] px-5 shadow-sm hover:bg-[#2f8bd0]"
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
        <PaymentMethodDrawer open={showModal} onOpenChange={setShowModal} />
      ) : null}
    </div>
  );
}
