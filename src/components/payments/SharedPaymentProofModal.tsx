"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  FileCheck2,
  FileImage,
  Info,
  Loader2,
  ReceiptText,
  ShieldCheck,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { createFileAssetFromUpload } from "@/actions/files/createFileAssetFromUpload";
import { deleteFileAssetAction } from "@/actions/files/file";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UploadButton } from "@/utils/uploadthing";
import { cn } from "@/lib/utils";

type ReceiptAttachment = {
  assetId: string;
  storageKey: string;
  url: string;
  name: string | null;
};

export type PaymentProofSubmitResult = {
  ok: boolean;
  message: string;
};

export type PaymentProofSubmitInput = {
  claimedAmount: number;
  depositorName: string;
  depositorAccountName: string;
  depositorAccountNo: string;
  transferReference: string;
  note: string;
  receiptFileId: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  defaultAmount: number;
  amountLabel: string;
  amountMin: number;
  amountMax: number | null;
  amountHint?: ReactNode;
  amountReadOnly?: boolean;
  mode?: "BANK_TRANSFER" | "CRYPTO_PROVIDER";
  submitLabel?: string;
  submit: (input: PaymentProofSubmitInput) => Promise<PaymentProofSubmitResult>;
};

function FormField({
  label,
  children,
  description,
}: {
  label: string;
  children: ReactNode;
  description?: string;
}) {
  return (
    <div className="grid min-w-0 gap-2">
      <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">
        {label}
      </label>
      {children}
      {description ? (
        <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function SectionHeading({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
          {title}
        </h3>
        {description ? (
          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

const fieldClassName =
  "h-11 rounded-xl border-slate-200/80 bg-white shadow-sm placeholder:text-slate-400 focus-visible:border-sky-400 focus-visible:ring-4 focus-visible:ring-sky-500/10 dark:border-white/10 dark:bg-slate-900/70 dark:text-white dark:placeholder:text-slate-500";

export default function SharedPaymentProofModal({
  open,
  onOpenChange,
  title,
  description,
  defaultAmount,
  amountLabel,
  amountMin,
  amountMax,
  amountHint,
  amountReadOnly = false,
  mode = "BANK_TRANSFER",
  submitLabel = "Submit proof",
  submit,
}: Props) {
  const [claimedAmount, setClaimedAmount] = useState(defaultAmount);
  const [depositorName, setDepositorName] = useState("");
  const [depositorAccountName, setDepositorAccountName] = useState("");
  const [depositorAccountNo, setDepositorAccountNo] = useState("");
  const [transferReference, setTransferReference] = useState("");
  const [note, setNote] = useState("");
  const [receiptAttachment, setReceiptAttachment] =
    useState<ReceiptAttachment | null>(null);
  const [isRemovingReceipt, setIsRemovingReceipt] = useState(false);
  const [pending, startTransition] = useTransition();

  const committedReceiptAssetIdRef = useRef<string | null>(null);
  const receiptAttachmentRef = useRef<ReceiptAttachment | null>(null);

  const hasReceiptImage = Boolean(receiptAttachment?.assetId);

  useEffect(() => {
    receiptAttachmentRef.current = receiptAttachment;
  }, [receiptAttachment]);

  useEffect(() => {
    if (open) {
      committedReceiptAssetIdRef.current = null;

      queueMicrotask(() => {
        setClaimedAmount(defaultAmount);
      });

      return;
    }

    const current = receiptAttachmentRef.current;

    if (!current || current.assetId === committedReceiptAssetIdRef.current) {
      return;
    }

    void deleteFileAssetAction(current.assetId).catch(() => {});
    receiptAttachmentRef.current = null;
    setReceiptAttachment(null);
  }, [defaultAmount, open]);

  useEffect(() => {
    return () => {
      const current = receiptAttachmentRef.current;

      if (!current || current.assetId === committedReceiptAssetIdRef.current) {
        return;
      }

      void deleteFileAssetAction(current.assetId).catch(() => {});
    };
  }, []);

  const receiptFileId = receiptAttachment?.assetId ?? "";
  const effectiveClaimedAmount = amountReadOnly ? defaultAmount : claimedAmount;

  const amountIsInvalid =
    !Number.isFinite(effectiveClaimedAmount) ||
    effectiveClaimedAmount < amountMin ||
    (amountMax !== null && effectiveClaimedAmount > amountMax);

  function resetForm() {
    setDepositorName("");
    setDepositorAccountName("");
    setDepositorAccountNo("");
    setTransferReference("");
    setNote("");
    setReceiptAttachment(null);
    setClaimedAmount(defaultAmount);
  }

  async function removeReceiptAttachment() {
    if (!receiptAttachment || isRemovingReceipt) return;

    setIsRemovingReceipt(true);

    try {
      const result = await deleteFileAssetAction(receiptAttachment.assetId);

      if (result?.error) {
        toast.error("Unable to remove receipt image.");
        return;
      }

      setReceiptAttachment(null);
      committedReceiptAssetIdRef.current = null;
      toast.success("Receipt removed.");
    } finally {
      setIsRemovingReceipt(false);
    }
  }

  function handleSubmit() {
    if (amountIsInvalid) {
      toast.error("Please enter a valid deposit amount.");
      return;
    }

    if (!hasReceiptImage) {
      toast.error("Please upload a receipt image before submitting.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await submit({
          claimedAmount: effectiveClaimedAmount,
          depositorName: mode === "BANK_TRANSFER" ? depositorName : "",
          depositorAccountName:
            mode === "BANK_TRANSFER" ? depositorAccountName : "",
          depositorAccountNo:
            mode === "BANK_TRANSFER" ? depositorAccountNo : "",
          transferReference: mode === "BANK_TRANSFER" ? transferReference : "",
          note: mode === "BANK_TRANSFER" ? note : "",
          receiptFileId,
        });

        if (!result.ok) {
          toast.error(result.message);
          return;
        }

        committedReceiptAssetIdRef.current = receiptAttachment?.assetId ?? null;
        toast.success(result.message);
        resetForm();
        onOpenChange(false);
      } catch (error) {
        console.error("SharedPaymentProofModal submit error:", error);
        toast.error("Unable to submit payment proof right now.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] flex-col gap-0 overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white p-0 text-slate-950 shadow-[0_32px_100px_rgba(15,23,42,0.22)] sm:max-h-[min(90dvh,900px)] sm:max-w-2xl sm:rounded-[1.85rem]",
          "dark:border-white/10 dark:bg-slate-950 dark:text-white",
        )}
      >
        <div className="relative shrink-0 overflow-hidden border-b border-slate-200/80 px-4 py-5 sm:px-6 sm:py-6 dark:border-white/10">
          <div className="pointer-events-none absolute -right-16 -top-24 h-52 w-52 rounded-full bg-sky-400/[0.09] blur-3xl dark:bg-sky-400/[0.08]" />

          <div className="relative flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-sky-200/70 bg-sky-50 text-sky-600 shadow-sm dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300">
              <ReceiptText className="h-5 w-5" />
            </div>

            <DialogHeader className="min-w-0 flex-1 space-y-1.5 text-left">
              <DialogTitle className="text-lg font-semibold tracking-tight sm:text-xl">
                {title}
              </DialogTitle>
              <DialogDescription className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                {description}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="relative mt-5 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-300">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full",
                hasReceiptImage
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                  : "bg-slate-100 text-slate-400 dark:bg-white/[0.06] dark:text-slate-500",
              )}
            >
              <FileCheck2 className="h-4 w-4" />
            </div>
            <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full",
                pending
                  ? "bg-sky-500/10 text-sky-600"
                  : "bg-slate-100 text-slate-400 dark:bg-white/[0.06] dark:text-slate-500",
              )}
            >
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>

          <div className="relative mt-2 flex justify-between text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
            <span>Payment details</span>
            <span>Receipt</span>
            <span>Review</span>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="space-y-6 px-4 py-5 sm:px-6 sm:py-6">
            <section className="overflow-hidden rounded-[1.25rem] border border-sky-200/60 bg-gradient-to-br from-sky-50 via-white to-white p-4 shadow-sm dark:border-sky-400/15 dark:from-sky-400/[0.08] dark:via-slate-900/70 dark:to-slate-900/70 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-sky-700/80 dark:text-sky-300/80">
                    {mode === "CRYPTO_PROVIDER"
                      ? "Crypto payment submission"
                      : "Payment submission"}
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                    {amountLabel}
                  </p>
                  <div className="mt-1 flex flex-wrap items-baseline gap-2">
                    <span className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                      {effectiveClaimedAmount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {amountReadOnly ? "Fixed amount" : "Amount claimed"}
                    </span>
                  </div>
                </div>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center self-start rounded-2xl border border-sky-200/70 bg-white/80 text-sky-600 shadow-sm sm:self-center dark:border-white/10 dark:bg-white/[0.04] dark:text-sky-300">
                  {mode === "CRYPTO_PROVIDER" ? (
                    <ArrowUpRight className="h-5 w-5" />
                  ) : (
                    <ReceiptText className="h-5 w-5" />
                  )}
                </div>
              </div>

              <div className="mt-4 grid gap-2 border-t border-sky-200/60 pt-3 dark:border-white/10 sm:grid-cols-2">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                    Minimum
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {amountMin.toLocaleString()}
                  </p>
                </div>
                {amountMax !== null ? (
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                      Maximum
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {amountMax.toLocaleString()}
                    </p>
                  </div>
                ) : null}
              </div>
            </section>

            <section className="space-y-4">
              <SectionHeading
                icon={<ReceiptText className="h-4 w-4" />}
                title={
                  mode === "CRYPTO_PROVIDER"
                    ? "Transaction information"
                    : "Transfer information"
                }
                description={
                  mode === "CRYPTO_PROVIDER"
                    ? "Provide the payment amount and attach evidence of your crypto transaction."
                    : "Enter the details of the bank transfer so the payment can be identified."
                }
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label={amountLabel}
                  description={
                    amountReadOnly
                      ? "This amount is fixed for this payment."
                      : "Enter the amount you actually transferred."
                  }
                >
                  <Input
                    type="number"
                    min={amountMin}
                    max={amountMax ?? undefined}
                    step="0.01"
                    value={amountReadOnly ? defaultAmount : claimedAmount}
                    readOnly={amountReadOnly}
                    aria-readonly={amountReadOnly}
                    aria-invalid={amountIsInvalid}
                    onChange={(event) =>
                      setClaimedAmount(Number(event.target.value))
                    }
                    className={cn(
                      fieldClassName,
                      amountReadOnly &&
                        "cursor-not-allowed bg-slate-100 text-slate-600 dark:bg-slate-900/80 dark:text-slate-300",
                      amountIsInvalid &&
                        !amountReadOnly &&
                        "border-rose-400 focus-visible:ring-rose-500/10",
                    )}
                  />
                  {amountHint ? <div>{amountHint}</div> : null}
                  {amountIsInvalid ? (
                    <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
                      Enter an amount between {amountMin.toLocaleString()}
                      {amountMax !== null
                        ? ` and ${amountMax.toLocaleString()}`
                        : ""}
                      .
                    </p>
                  ) : null}
                </FormField>

                {mode === "BANK_TRANSFER" ? (
                  <FormField label="Transfer reference">
                    <Input
                      value={transferReference}
                      onChange={(event) =>
                        setTransferReference(event.target.value)
                      }
                      placeholder="Enter bank transfer reference"
                      className={fieldClassName}
                    />
                  </FormField>
                ) : null}
              </div>

              {mode === "BANK_TRANSFER" ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Depositor name">
                    <Input
                      value={depositorName}
                      onChange={(event) => setDepositorName(event.target.value)}
                      placeholder="Enter depositor name"
                      className={fieldClassName}
                    />
                  </FormField>

                  <FormField label="Depositor account name">
                    <Input
                      value={depositorAccountName}
                      onChange={(event) =>
                        setDepositorAccountName(event.target.value)
                      }
                      placeholder="Enter account name"
                      className={fieldClassName}
                    />
                  </FormField>

                  <div className="sm:col-span-2">
                    <FormField label="Depositor account number">
                      <Input
                        value={depositorAccountNo}
                        onChange={(event) =>
                          setDepositorAccountNo(event.target.value)
                        }
                        placeholder="Enter account number"
                        className={fieldClassName}
                      />
                    </FormField>
                  </div>
                </div>
              ) : null}
            </section>

            <section className="space-y-4">
              <SectionHeading
                icon={<FileImage className="h-4 w-4" />}
                title="Payment receipt"
                description="Attach a clear image of your payment confirmation."
              />

              {!receiptAttachment ? (
                <div className="rounded-[1.25rem] border border-dashed border-sky-300/70 bg-sky-50/40 p-5 dark:border-sky-400/20 dark:bg-sky-400/[0.035] sm:p-6">
                  <div className="mx-auto flex max-w-sm flex-col items-center text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-200/70 bg-white text-sky-600 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-sky-300">
                      <UploadCloud className="h-6 w-6" />
                    </div>

                    <h4 className="mt-4 text-sm font-semibold text-slate-950 dark:text-white">
                      Upload payment receipt
                    </h4>
                    <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500 dark:text-slate-400">
                      Choose a clear screenshot or image showing your completed
                      payment.
                    </p>

                    <div className="mt-4 w-full max-w-xs">
                      <UploadButton
                        endpoint="photoManager"
                        className="ut-button:mt-0 ut-button:inline-flex ut-button:h-11 ut-button:w-full ut-button:items-center ut-button:justify-center ut-button:rounded-full ut-button:border ut-button:border-slate-900 ut-button:bg-slate-950 ut-button:px-5 ut-button:text-sm ut-button:font-semibold ut-button:text-white ut-button:shadow-sm ut-button:transition ut-button:hover:bg-slate-800 ut-button:disabled:opacity-60 dark:ut-button:border-white dark:ut-button:bg-white dark:ut-button:text-slate-950 dark:ut-button:hover:bg-slate-200"
                        onClientUploadComplete={async (res) => {
                          try {
                            const file = res?.[0];

                            if (!file) {
                              toast.error("Upload failed");
                              return;
                            }

                            const asset = await createFileAssetFromUpload({
                              url: file.url,
                              key: file.key,
                              name: file.name,
                              size: file.size,
                              type: file.type,
                            });

                            setReceiptAttachment({
                              assetId: asset.id,
                              storageKey: file.key,
                              url: file.url,
                              name: file.name ?? null,
                            });

                            committedReceiptAssetIdRef.current = null;
                            toast.success("Receipt attached");
                          } catch {
                            toast.error("Unable to attach receipt");
                          }
                        }}
                        onUploadError={() => {
                          toast.error("Receipt upload failed");
                        }}
                      />
                    </div>

                    <p className="mt-3 text-[11px] text-slate-400 dark:text-slate-500">
                      PNG, JPG and WEBP supported
                    </p>
                  </div>
                </div>
              ) : (
                <div className="overflow-hidden rounded-[1.25rem] border border-emerald-200/70 bg-emerald-50/40 dark:border-emerald-400/15 dark:bg-emerald-400/[0.035]">
                  <div className="flex items-center justify-between gap-3 border-b border-emerald-200/60 px-4 py-3 dark:border-white/10">
                    <div className="flex min-w-0 items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300" />
                      <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                        Receipt attached
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => void removeReceiptAttachment()}
                      disabled={isRemovingReceipt || pending}
                      className="h-8 shrink-0 rounded-full px-3 text-xs text-rose-600 hover:bg-rose-500/10 hover:text-rose-700 dark:text-rose-300 dark:hover:text-rose-200"
                    >
                      {isRemovingReceipt ? (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <X className="mr-1.5 h-3.5 w-3.5" />
                      )}
                      Remove
                    </Button>
                  </div>

                  <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                    <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm sm:h-24 sm:w-28 dark:border-white/10 dark:bg-slate-900">
                      <Image
                        src={receiptAttachment.url}
                        alt={receiptAttachment.name ?? "Receipt preview"}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="break-words text-sm font-semibold text-slate-950 dark:text-white">
                        {receiptAttachment.name ?? "Payment receipt"}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                        Your receipt has been attached and is ready to submit
                        with your payment details.
                      </p>
                      <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                        <FileCheck2 className="h-3.5 w-3.5" />
                        Ready for submission
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!hasReceiptImage ? (
                <p className="flex items-center gap-2 text-xs font-medium text-rose-600 dark:text-rose-400">
                  <Info className="h-3.5 w-3.5 shrink-0" />A receipt image is
                  required before you can submit.
                </p>
              ) : null}
            </section>

            {mode === "BANK_TRANSFER" ? (
              <section className="space-y-3">
                <SectionHeading
                  icon={<Info className="h-4 w-4" />}
                  title="Additional information"
                  description="Include anything that may help the admin verify your transfer."
                />

                <FormField label="Note (optional)">
                  <Textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Add any useful details for admin review..."
                    rows={3}
                    className="min-h-24 resize-y rounded-xl border-slate-200/80 bg-white shadow-sm placeholder:text-slate-400 focus-visible:border-sky-400 focus-visible:ring-4 focus-visible:ring-sky-500/10 dark:border-white/10 dark:bg-slate-900/70 dark:text-white dark:placeholder:text-slate-500"
                  />
                </FormField>
              </section>
            ) : null}

            <div className="flex items-start gap-3 rounded-xl border border-slate-200/70 bg-slate-50/80 p-3.5 dark:border-white/[0.08] dark:bg-white/[0.025]">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300" />
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Secure payment verification
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  Your submission will be sent for admin review. Payment is not
                  confirmed until verification is complete.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-slate-200/80 bg-white/95 px-4 py-4 sm:px-6 dark:border-white/10 dark:bg-slate-950/95">
          <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
              className="h-11 w-full rounded-full border-slate-200 bg-white px-5 text-slate-700 hover:bg-slate-50 sm:w-auto dark:border-white/10 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={
                pending ||
                amountIsInvalid ||
                !hasReceiptImage ||
                isRemovingReceipt
              }
              className="h-11 w-full rounded-full bg-slate-950 px-6 font-semibold text-white shadow-[0_10px_25px_rgba(2,6,23,0.2)] hover:bg-slate-800 sm:w-auto dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting proof...
                </>
              ) : (
                <>
                  {submitLabel}
                  <ArrowUpRight className="ml-1.5 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
