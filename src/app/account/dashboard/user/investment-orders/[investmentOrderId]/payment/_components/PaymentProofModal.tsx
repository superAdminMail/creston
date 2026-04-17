"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitInvestmentBankPaymentProof } from "@/actions/accounts/payments/submitInvestmentBankPaymentProof";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  platformPaymentMethodId: string | null;
  currency: string;
  defaultAmount: number;
  maxAmount: number;
};

export default function PaymentProofModal({
  open,
  onOpenChange,
  orderId,
  platformPaymentMethodId,
  currency,
  defaultAmount,
  maxAmount,
}: Props) {
  const [claimedAmount, setClaimedAmount] = useState(defaultAmount);
  const [depositorName, setDepositorName] = useState("");
  const [depositorAccountName, setDepositorAccountName] = useState("");
  const [depositorAccountNo, setDepositorAccountNo] = useState("");
  const [transferReference, setTransferReference] = useState("");
  const [note, setNote] = useState("");
  const [receiptFileId, setReceiptFileId] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      setClaimedAmount(defaultAmount);
    }
  }, [defaultAmount, open]);

  function resetForm() {
    setDepositorName("");
    setDepositorAccountName("");
    setDepositorAccountNo("");
    setTransferReference("");
    setNote("");
    setReceiptFileId("");
  }

  function handleSubmit() {
    if (!platformPaymentMethodId) {
      toast.error("No bank payment method is currently available.");
      return;
    }

    startTransition(async () => {
      const result = await submitInvestmentBankPaymentProof({
        orderId,
        platformPaymentMethodId,
        claimedAmount,
        depositorName,
        depositorAccountName,
        depositorAccountNo,
        transferReference,
        note,
        receiptFileId,
      });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      resetForm();
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Submit payment proof</DialogTitle>
          <DialogDescription>
            Confirm the transfer details you used and upload your receipt file
            ID if available.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">
              Claimed amount ({currency})
            </label>
            <Input
              type="number"
              min={1}
              max={maxAmount}
              step="0.01"
              value={claimedAmount}
              onChange={(e) => setClaimedAmount(Number(e.target.value))}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Depositor name</label>
            <Input
              value={depositorName}
              onChange={(e) => setDepositorName(e.target.value)}
              placeholder="Enter depositor name"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">
              Depositor account name
            </label>
            <Input
              value={depositorAccountName}
              onChange={(e) => setDepositorAccountName(e.target.value)}
              placeholder="Enter depositor account name"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">
              Depositor account number
            </label>
            <Input
              value={depositorAccountNo}
              onChange={(e) => setDepositorAccountNo(e.target.value)}
              placeholder="Enter depositor account number"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Transfer reference</label>
            <Input
              value={transferReference}
              onChange={(e) => setTransferReference(e.target.value)}
              placeholder="Bank transfer reference"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Receipt file ID</label>
            <Input
              value={receiptFileId}
              onChange={(e) => setReceiptFileId(e.target.value)}
              placeholder="Paste uploaded receipt file ID"
            />
            <p className="text-xs text-muted-foreground">
              Replace this input with your UploadThing or file asset picker when
              you wire the upload UI.
            </p>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Note</label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add any useful details for admin review"
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>

            <Button type="button" onClick={handleSubmit} disabled={pending}>
              {pending ? "Submitting..." : "Submit proof"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
