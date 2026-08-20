"use client";

import { useActionState, useEffect, useMemo, useRef } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  createSupportVerificationAction,
  type CreateSupportVerificationActionState,
} from "@/actions/admin/support/createSupportVerificationAction";
import { getSupportVerificationCopy } from "@/lib/support/supportVerificationCopy";
import { DashboardActionSubmitButton } from "../../_components/DashboardActionSubmitButton";

type SupportVerificationUserOption = {
  id: string;
  name: string;
  email: string;
};

type Props = {
  users: SupportVerificationUserOption[];
  siteName: string;
};

const initialState: CreateSupportVerificationActionState = {
  status: "idle",
};

export default function SupportVerificationForm({ users, siteName }: Props) {
  const [state, formAction] = useActionState(
    createSupportVerificationAction,
    initialState,
  );

  const lastToastKey = useRef<string | null>(null);
  const supportVerificationCopy = getSupportVerificationCopy(siteName);

  const userOptions = useMemo(() => {
    return users.map((user) => ({
      ...user,
      label: `${user.email}${user.name ? ` — ${user.name}` : ""}`,
    }));
  }, [users]);

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
      return;
    }

    toast.error(state.message);
  }, [state.status, state.message, state.supportVerificationId]);

  return (
    <Card className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(8,17,37,0.98))] text-white shadow-[0_20px_50px_rgba(0,0,0,0.22)]">
      <CardHeader className="border-b border-white/8 px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/10">
            <ShieldCheck className="size-5 text-blue-300" />
          </div>

          <div className="space-y-1">
            <CardTitle className="text-lg sm:text-xl">
              Support verification
            </CardTitle>

            <CardDescription className="text-sm text-slate-400">
              Request customer support call verification
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4 py-5 sm:px-6 sm:py-6">
        <form action={formAction} className="space-y-5">
          <div className="grid gap-2">
            <label htmlFor="userId" className="text-sm font-medium text-white">
              Customer
            </label>

            <select
              id="userId"
              name="userId"
              required
              defaultValue=""
              className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none transition focus:border-blue-400/40 focus:ring-2 focus:ring-blue-400/10"
            >
              <option value="" disabled>
                Select customer by email
              </option>

              {userOptions.map((user) => (
                <option
                  key={user.id}
                  value={user.id}
                  className="bg-slate-950 text-white"
                >
                  {user.label}
                </option>
              ))}
            </select>

            <p className="text-xs text-slate-500">
              This customer will receive the verification notice in their
              dashboard.
            </p>
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="representativeName"
              className="text-sm font-medium text-white"
            >
              Representative
            </label>

            <Input
              id="representativeName"
              name="representativeName"
              placeholder="Tamara J"
              required
              maxLength={100}
              className="h-11 rounded-2xl border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500"
            />

            <p className="text-xs text-slate-500">
              Enter the support representative&apos;s display name.
            </p>
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="department"
              className="text-sm font-medium text-white"
            >
              Department
            </label>

            <Input
              id="department"
              name="department"
              defaultValue="Customer Support"
              placeholder="Customer Support"
              required
              maxLength={100}
              className="h-11 rounded-2xl border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="reason" className="text-sm font-medium text-white">
              Reason
            </label>

            <Textarea
              id="reason"
              name="reason"
              rows={4}
              defaultValue="Follow-up regarding your support request"
              placeholder="Follow-up regarding your support request"
              required
              maxLength={500}
              className="rounded-2xl border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500"
            />

            <p className="text-xs text-slate-500">
              This reason is shown to the customer in the verification notice.
            </p>
          </div>

          <div className="rounded-2xl border border-blue-400/15 bg-blue-400/5 p-4">
            <p className="text-sm font-medium text-white">
              Customer-facing preview
            </p>

            <div className="mt-3 space-y-1 text-sm text-slate-300">
              <p className="font-semibold text-white">
                {supportVerificationCopy.adminPreviewTitle}
              </p>

              <p>
                Representative: <span className="text-white">Tamara J</span>
              </p>

              <p>
                Department: <span className="text-white">Customer Support</span>
              </p>

              <p>
                Reason:{" "}
                <span className="text-white">
                  Follow-up regarding your support request
                </span>
              </p>

              <p>
                Time:{" "}
                <span className="text-white">Automatically generated</span>
              </p>
            </div>
          </div>

          <DashboardActionSubmitButton
            idleLabel="Send support verification"
            pendingLabel="Sending verification..."
            pendingIcon={<Loader2 className="h-4 w-4 animate-spin" />}
            className="rounded-full bg-[#3c9ee0] px-5 text-white shadow-[0_18px_40px_-22px_rgba(60,158,224,0.9)] hover:bg-[#2f8bd0]"
          />
        </form>
      </CardContent>
    </Card>
  );
}
