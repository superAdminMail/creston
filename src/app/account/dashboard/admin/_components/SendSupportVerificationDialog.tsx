"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  createSupportVerificationAction,
  type CreateSupportVerificationActionState,
} from "@/actions/admin/support/createSupportVerificationAction";
import { getSupportVerificationCopy } from "@/lib/support/supportVerificationCopy";

import { DashboardActionSubmitButton } from "../../_components/DashboardActionSubmitButton";

type UserOption = {
  id: string;
  name: string | null;
  email: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: UserOption[];
  siteName: string;
};

const initialState: CreateSupportVerificationActionState = {
  status: "idle",
};

const DEFAULT_VALUES = {
  userId: "",
  representativeName: "",
  department: "Customer Support",
  reason: "Follow-up regarding your support request",
};

export default function SendSupportVerificationDialog({
  open,
  onOpenChange,
  users,
  siteName,
}: Props) {
  const [state, formAction, isPending] = useActionState(
    createSupportVerificationAction,
    initialState,
  );

  const [form, setForm] = useState(DEFAULT_VALUES);

  const lastToastKey = useRef<string | null>(null);
  const supportVerificationCopy = getSupportVerificationCopy(siteName);

  const updateField = (field: keyof typeof DEFAULT_VALUES, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm(DEFAULT_VALUES);
  };

  useEffect(() => {
    if (state.status === "idle" || !state.message) {
      return;
    }

    const toastKey = `${state.status}:${state.message}:${
      state.supportVerificationId ?? ""
    }`;

    if (lastToastKey.current === toastKey) {
      return;
    }

    lastToastKey.current = toastKey;

    if (state.status === "success") {
      toast.success(state.message);

      resetForm();
      onOpenChange(false);

      return;
    }

    toast.error(state.message);
  }, [state.status, state.message, state.supportVerificationId, onOpenChange]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (isPending) {
      return;
    }

    onOpenChange(nextOpen);

    if (!nextOpen) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-border/60 bg-white/96 text-slate-950 shadow-[0_24px_70px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-slate-950/96 dark:text-white sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-sky-200/70 bg-sky-50 text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div className="space-y-1">
              <DialogTitle className="text-slate-950 dark:text-white">
                {supportVerificationCopy.adminPreviewTitle}
              </DialogTitle>

              <DialogDescription className="leading-6 text-slate-600 dark:text-slate-400">
                Send a verification notice to the customer before discussing
                account-related information over an outbound support call.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form action={formAction} className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label htmlFor="support-verification-userId">Customer</Label>

            <select
              id="support-verification-userId"
              name="userId"
              value={form.userId}
              onChange={(event) => updateField("userId", event.target.value)}
              disabled={isPending}
              required
              className="h-11 w-full rounded-2xl border border-border/60 bg-white/95 px-3 text-sm text-slate-950 outline-none transition dark:border-white/10 dark:bg-slate-900 dark:text-white"
            >
              <option value="" disabled>
                Select customer by email
              </option>

              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.email}
                  {user.name ? ` — ${user.name}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="support-verification-representative">
              Representative
            </Label>

            <Input
              id="support-verification-representative"
              name="representativeName"
              value={form.representativeName}
              onChange={(event) =>
                updateField("representativeName", event.target.value)
              }
              disabled={isPending}
              placeholder="Tamara A."
              required
              maxLength={100}
              className="h-11 rounded-2xl border-border/60 bg-white/95 dark:border-white/10 dark:bg-white/[0.04]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="support-verification-department">Department</Label>

            <Input
              id="support-verification-department"
              name="department"
              value={form.department}
              onChange={(event) =>
                updateField("department", event.target.value)
              }
              disabled={isPending}
              placeholder="Customer Support"
              required
              maxLength={100}
              className="h-11 rounded-2xl border-border/60 bg-white/95 dark:border-white/10 dark:bg-white/[0.04]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="support-verification-reason">Reason</Label>

            <Input
              id="support-verification-reason"
              name="reason"
              value={form.reason}
              onChange={(event) => updateField("reason", event.target.value)}
              disabled={isPending}
              placeholder="Follow-up regarding your support request"
              required
              maxLength={500}
              className="h-11 rounded-2xl border-border/60 bg-white/95 dark:border-white/10 dark:bg-white/[0.04]"
            />
          </div>

          <div className="rounded-2xl border border-sky-200/70 bg-sky-50/70 p-4 text-sm leading-6 text-sky-950 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-100">
            {supportVerificationCopy.adminPreviewDescription}
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              disabled={isPending}
              onClick={() => handleOpenChange(false)}
              className="rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/[0.08] dark:hover:text-white"
            >
              Cancel
            </Button>

            <DashboardActionSubmitButton
              idleLabel="Send verification"
              pendingLabel="Sending..."
              pendingIcon={<Loader2 className="h-4 w-4 animate-spin" />}
              className="rounded-full bg-[#3c9ee0] px-5 text-white shadow-[0_18px_40px_-22px_rgba(60,158,224,0.9)] hover:bg-[#2f8bd0]"
            />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
