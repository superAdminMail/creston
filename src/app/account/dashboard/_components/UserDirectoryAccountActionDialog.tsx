"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { suspendUserAction } from "@/actions/super-admin/users/suspendUserAction";
import { unsuspendUserAction } from "@/actions/super-admin/users/unsuspendUserAction";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DashboardDirectoryUser } from "@/lib/types/dashboard";

type UserActionMode = "suspend" | "unsuspend";

type UserDirectoryAccountActionDialogProps = {
  target: {
    user: DashboardDirectoryUser;
    mode: UserActionMode;
  } | null;
  selectedUser: DashboardDirectoryUser | null;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: (user: DashboardDirectoryUser) => void;
};

const initialSuspendUserState = { status: "idle" as const };

export function UserDirectoryAccountActionDialog({
  target,
  selectedUser,
  onOpenChange,
  onUserUpdated,
}: UserDirectoryAccountActionDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [requestError, setRequestError] = useState<string | null>(null);

  function handleOpenChange(open: boolean) {
    if (!open && isPending) return;

    if (open) setRequestError(null);
    onOpenChange(open);
  }

  function handleAction() {
    if (!target || isPending) return;

    const currentTarget = target;
    setRequestError(null);

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("userId", currentTarget.user.id);

        const action =
          currentTarget.mode === "suspend"
            ? suspendUserAction
            : unsuspendUserAction;

        const result = await action(initialSuspendUserState, formData);

        if (result.status === "error") {
          const message =
            result.message ??
            (currentTarget.mode === "suspend"
              ? "Unable to suspend this user."
              : "Unable to reactivate this user.");

          setRequestError(message);
          toast.error(message);
          return;
        }

        toast.success(
          result.message ??
            (currentTarget.mode === "suspend"
              ? "User suspended successfully."
              : "User reactivated successfully."),
        );

        if (selectedUser?.id === currentTarget.user.id) {
          onUserUpdated({
            ...selectedUser,
            isSuspended: currentTarget.mode === "suspend",
            accountStatus:
              currentTarget.mode === "suspend" ? "SUSPENDED" : "ACTIVE",
          });
        }

        onOpenChange(false);
        router.refresh();
      } catch (error) {
        console.error("User account action failed:", error);

        const message =
          currentTarget.mode === "suspend"
            ? "Unable to suspend this user. Please try again."
            : "Unable to reactivate this user. Please try again.";

        setRequestError(message);
        toast.error(message);
      }
    });
  }

  return (
    <Dialog open={Boolean(target)} onOpenChange={handleOpenChange}>
      <DialogContent className="!rounded-[1.75rem] !border-slate-200 !bg-white !bg-none !p-0 !text-slate-950 !shadow-[0_24px_70px_rgba(15,23,42,0.18)] dark:!border-white/10 dark:!bg-zinc-950 dark:!text-white">
        {target ? (
          <div className="space-y-5 p-5 sm:p-6">
            <DialogHeader className="space-y-3">
              <div
                className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border shadow-sm ${
                  target.mode === "suspend"
                    ? "border-rose-200/70 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300"
                    : "border-emerald-200/70 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300"
                }`}
              >
                {target.mode === "suspend" ? (
                  <ShieldAlert className="h-5 w-5" />
                ) : (
                  <ShieldCheck className="h-5 w-5" />
                )}
              </div>

              <DialogTitle className="text-2xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">
                {target.mode === "suspend" ? "Suspend user" : "Unsuspend user"}
              </DialogTitle>

              <DialogDescription className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                {target.mode === "suspend"
                  ? `${target.user.fullName} will be suspended and prevented from signing in until the account is reactivated.`
                  : `${target.user.fullName} will regain access after the account is reactivated.`}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 rounded-[1.35rem] border border-slate-200/80 bg-slate-50 p-4 text-sm text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
              <div className="flex items-start justify-between gap-4">
                <span>Email</span>
                <span className="break-all text-right font-medium text-slate-950 dark:text-white">
                  {target.user.email}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span>Account status</span>
                <span className="font-medium text-slate-950 dark:text-white">
                  {target.user.accountStatus}
                </span>
              </div>
            </div>

            {requestError ? (
              <div
                role="alert"
                className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300"
              >
                {requestError}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 border-t border-slate-200/80 pt-4 sm:flex-row sm:justify-end dark:border-white/10">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08]"
                disabled={isPending}
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleAction}
                disabled={isPending}
                className={`rounded-full text-white ${
                  target.mode === "suspend"
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {isPending
                  ? target.mode === "suspend"
                    ? "Suspending..."
                    : "Unsuspending..."
                  : target.mode === "suspend"
                    ? "Suspend user"
                    : "Unsuspend user"}
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
