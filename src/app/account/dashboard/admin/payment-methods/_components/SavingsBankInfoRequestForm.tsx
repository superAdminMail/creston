"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { RespondToSavingsFundingBankInfoRequestState } from "@/actions/admin/savings-payments/respondToSavingsFundingBankInfoRequest";
import { respondToSavingsFundingBankInfoRequest } from "@/actions/admin/savings-payments/respondToSavingsFundingBankInfoRequest";

const initialState: RespondToSavingsFundingBankInfoRequestState = {
  status: "idle",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? "Sending bank details..." : "Send bank details"}
    </Button>
  );
}

export default function SavingsBankInfoRequestForm({
  request,
}: {
  request: {
    savingsAccountId: string;
    requesterName: string | null;
    requesterEmail: string | null;
    savingsProductName: string;
    currency: string;
  };
}) {
  const [state, formAction] = useActionState(
    respondToSavingsFundingBankInfoRequest,
    initialState,
  );
  const lastToastKey = useRef<string | null>(null);

  useEffect(() => {
    if (state.status === "idle" || !state.message) {
      return;
    }

    const toastKey = `${state.status}:${state.message}:${request.savingsAccountId}`;

    if (lastToastKey.current === toastKey) {
      return;
    }

    lastToastKey.current = toastKey;

    if (state.status === "success") {
      toast.success(state.message);
      return;
    }

    toast.error(state.message);
  }, [request.savingsAccountId, state.message, state.status]);

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">
          Send bank details for {request.savingsProductName}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Requested by {request.requesterName ?? request.requesterEmail ?? "Unknown"}{" "}
          for savings account {request.savingsAccountId}.
        </p>
      </CardHeader>

      <CardContent>
        <form action={formAction} className="space-y-4">
          <input
            type="hidden"
            name="savingsAccountId"
            value={request.savingsAccountId}
          />
          <input type="hidden" name="type" value="BANK_INFO" />
          <input type="hidden" name="currency" value={request.currency} />
          <input type="hidden" name="isPrivate" value="true" />
          <input type="hidden" name="isActive" value="true" />
          <input type="hidden" name="isDefault" value="false" />
          <input type="hidden" name="sortOrder" value="0" />
          <input type="hidden" name="verificationStatus" value="VERIFIED" />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2 md:col-span-2">
              <label className="text-sm font-medium">Label</label>
              <Input
                name="label"
                defaultValue={`Bank details for ${request.savingsProductName}`}
                required
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Provider name</label>
              <Input name="providerName" placeholder="Bank or provider name" />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Country</label>
              <Input name="country" placeholder="Country" />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Bank name</label>
              <Input name="bankName" required placeholder="Bank name" />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Bank code</label>
              <Input name="bankCode" placeholder="Bank code or sort code" />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Account name</label>
              <Input name="accountName" required placeholder="Account name" />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Reference</label>
              <Input name="reference" placeholder="Optional payment reference" />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Bank address</label>
              <Input name="bankAddress" placeholder="Optional bank address" />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Account number</label>
              <Input
                name="accountNumber"
                required
                placeholder="Account number"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">IBAN</label>
              <Input name="iban" placeholder="Optional IBAN" />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Swift code</label>
              <Input name="swiftCode" placeholder="Optional SWIFT/BIC" />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Routing number</label>
              <Input
                name="routingNumber"
                placeholder="Optional routing number"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Branch name</label>
              <Input name="branchName" placeholder="Optional branch" />
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Instructions</label>
            <Textarea
              name="instructions"
              rows={4}
              placeholder="Transfer instructions the user should follow."
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Notes</label>
            <Textarea
              name="notes"
              rows={3}
              placeholder="Internal or user-facing notes."
            />
          </div>

          {state.message ? (
            <div
              className={`rounded-xl border px-4 py-3 text-sm ${
                state.status === "success"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : "border-destructive/30 bg-destructive/10 text-destructive"
              }`}
            >
              {state.message}
            </div>
          ) : null}

          <div className="flex justify-end">
            <SubmitButton />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
