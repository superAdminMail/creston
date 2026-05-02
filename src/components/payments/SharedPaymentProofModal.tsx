"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
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
  receiptFileId?: string;
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
  mode?: "BANK_TRANSFER" | "CRYPTO_PROVIDER";
  submitLabel?: string;
  submit: (input: PaymentProofSubmitInput) => Promise<PaymentProofSubmitResult>;
};

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
  const amountIsInvalid =
    !Number.isFinite(claimedAmount) ||
    claimedAmount < amountMin ||
    (amountMax !== null && claimedAmount > amountMax);

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
        toast.error(result.error);
        return;
      }

      setReceiptAttachment(null);
      committedReceiptAssetIdRef.current = null;
    } finally {
      setIsRemovingReceipt(false);
    }
  }

  function handleSubmit() {
    if (amountIsInvalid) {
      toast.error("Please enter a valid deposit amount.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await submit({
          claimedAmount,
          depositorName: mode === "BANK_TRANSFER" ? depositorName : "",
          depositorAccountName:
            mode === "BANK_TRANSFER" ? depositorAccountName : "",
          depositorAccountNo:
            mode === "BANK_TRANSFER" ? depositorAccountNo : "",
          transferReference: mode === "BANK_TRANSFER" ? transferReference : "",
          note: mode === "BANK_TRANSFER" ? note : "",
          receiptFileId: receiptFileId || undefined,
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
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to submit payment proof.",
        );
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] max-h-[calc(100dvh-1rem)] overflow-y-auto rounded-[1.35rem] border border-slate-200/90 bg-white p-0 text-slate-950 shadow-[0_32px_100px_rgba(15,23,42,0.28)] sm:max-w-2xl sm:rounded-[1.75rem] dark:border-white/10 dark:bg-slate-950 dark:text-white">
        <div className="border-b border-slate-200/80 px-4 py-4 sm:px-6 sm:py-5 dark:border-white/10">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-lg font-semibold tracking-tight sm:text-xl">
              {title}
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-slate-500 dark:text-slate-400">
              {description}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-5 px-4 py-4 sm:px-6 sm:py-6">
          <div
            className={
              mode === "CRYPTO_PROVIDER"
                ? "grid gap-4"
                : "grid gap-4 sm:grid-cols-2"
            }
          >
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {amountLabel}
              </label>
              <Input
                type="number"
                min={amountMin}
                max={amountMax ?? undefined}
                step="0.01"
                value={claimedAmount}
                onChange={(event) =>
                  setClaimedAmount(Number(event.target.value))
                }
                className="border-slate-200/80 bg-white/80 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
              />
              {amountHint ? <div>{amountHint}</div> : null}
            </div>

            {mode === "BANK_TRANSFER" ? (
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Transfer reference
                </label>
                <Input
                  value={transferReference}
                  onChange={(event) => setTransferReference(event.target.value)}
                  placeholder="Bank transfer reference"
                  className="border-slate-200/80 bg-white/80 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
                />
              </div>
            ) : null}
          </div>

          {mode === "BANK_TRANSFER" ? (
            <>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Depositor name
                </label>
                <Input
                  value={depositorName}
                  onChange={(event) => setDepositorName(event.target.value)}
                  placeholder="Enter depositor name"
                  className="border-slate-200/80 bg-white/80 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Depositor account name
                </label>
                <Input
                  value={depositorAccountName}
                  onChange={(event) =>
                    setDepositorAccountName(event.target.value)
                  }
                  placeholder="Enter depositor account name"
                  className="border-slate-200/80 bg-white/80 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Depositor account number
                </label>
                <Input
                  value={depositorAccountNo}
                  onChange={(event) => setDepositorAccountNo(event.target.value)}
                  placeholder="Enter depositor account number"
                  className="border-slate-200/80 bg-white/80 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
                />
              </div>
            </>
          ) : null}

          <div className="grid gap-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Receipt image
                </p>
                <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                  Upload a proof image through Photo Manager.
                </p>
              </div>

              {receiptAttachment ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => void removeReceiptAttachment()}
                  disabled={isRemovingReceipt}
                  className="w-full rounded-full border border-slate-200/80 bg-white/70 text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700 sm:w-auto dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-red-500/10 dark:hover:text-red-200"
                >
                  {isRemovingReceipt ? "Removing..." : "Delete"}
                </Button>
              ) : null}
            </div>

            {!receiptAttachment ? (
              <div className="w-full rounded-[1.25rem] border border-dashed border-slate-300/70 bg-slate-600/10 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-slate-900/90">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-950 dark:text-white">
                    Add receipt image
                  </p>
                  <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                    PNG, JPG, and WEBP files are supported.
                  </p>
                </div>

                <UploadButton
                  endpoint="photoManager"
                  className="ut-button:mt-4 ut-button:inline-flex ut-button:h-11 ut-button:w-full ut-button:items-center ut-button:justify-center ut-button:rounded-full ut-button:!border ut-button:!border-white/10 ut-button:!bg-slate-950 ut-button:px-5 ut-button:text-sm ut-button:font-semibold ut-button:!text-white ut-button:shadow-[0_14px_34px_rgba(2,6,23,0.48)] ut-button:transition ut-button:hover:-translate-y-0.5 ut-button:hover:!bg-slate-900 ut-button:disabled:translate-y-0 ut-button:disabled:opacity-70 sm:ut-button:w-auto dark:ut-button:!border-white/10 dark:ut-button:!bg-slate-950 dark:ut-button:!text-white dark:ut-button:hover:!bg-slate-900"
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
            ) : (
              <div className="flex flex-col gap-4 rounded-[1.25rem] border border-slate-200/80 bg-white/88 p-4 shadow-[0_14px_32px_rgba(15,23,42,0.08)] sm:flex-row sm:items-center dark:border-white/10 dark:bg-white/[0.045]">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 dark:border-white/10 dark:bg-white/[0.03]">
                  <Image
                    src={receiptAttachment.url}
                    alt={receiptAttachment.name ?? "Receipt preview"}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-950 dark:text-white">
                    {receiptAttachment.name ?? "Receipt image"}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    Attached receipt ready for submission.
                  </p>
                </div>
              </div>
            )}
          </div>

          {mode === "BANK_TRANSFER" ? (
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Note{" "}
                <span className="text-slate-400 dark:text-slate-500">
                  (optional)
                </span>
              </label>
              <Textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Add any useful details for admin review"
                rows={4}
                className="border-slate-200/80 bg-white/80 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
              />
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200/80 pt-4 sm:flex-row sm:justify-end dark:border-white/10">
            <Button
              type="button"
              variant="destructive"
              onClick={() => onOpenChange(false)}
              disabled={pending}
              className="w-full rounded-full border-slate-200/80 bg-white/80 text-slate-700 hover:bg-slate-50 sm:w-auto dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.06]"
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={pending || amountIsInvalid}
              className="w-full rounded-full bg-slate-950 px-5 text-white shadow-[0_12px_28px_rgba(2,6,23,0.32)] hover:bg-slate-800 sm:w-auto dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              {pending ? "Submitting..." : submitLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
