"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  KeyRound,
  Lock,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { DashboardSectionCard } from "@/app/account/dashboard/_components/DashboardSectionCard";
import { DASHBOARD_PAGE_SURFACE_CLASS } from "@/app/account/dashboard/_components/dashboardSurfaces";
import PasswordForm from "@/app/auth/_components/PasswordForm";
import { AlertTriangle, UserRoundX } from "lucide-react";
import { deactivateCurrentUserAccount } from "@/actions/auth/deactivateCurrentUserAccount";
import { signOut } from "@/lib/auth-client";
import { useAuthStore } from "@/stores/useAuthstore";

type SecuritySectionProps = {
  siteName?: string;
};

export default function SecuritySection({ siteName }: SecuritySectionProps) {
  const [open, setOpen] = useState(false);
  const [closeAccountOpen, setCloseAccountOpen] = useState(false);
  const [isClosingAccount, setIsClosingAccount] = useState(false);
  const [closureError, setClosureError] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const resolvedSiteName = siteName?.trim() || "Havenstone";

  async function handleCloseAccount() {
    if (isClosingAccount) return;

    setIsClosingAccount(true);
    setClosureError(null);

    try {
      const result = await deactivateCurrentUserAccount();

      if ("error" in result) {
        setClosureError(result.error);
        return;
      }

      setCloseAccountOpen(false);

      try {
        await signOut();
      } catch (error) {
        console.error("Sign-out after account closure failed:", error);
      } finally {
        useAuthStore.getState().logout();
        queryClient.clear();

        window.location.replace(
          result.outcome === "DELETED"
            ? "/auth/login?account=deleted"
            : "/auth/login?account=deactivated",
        );
      }
    } catch {
      setClosureError("We couldn't close your account. Please try again.");
    } finally {
      setIsClosingAccount(false);
    }
  }

  const items = [
    {
      title: "Password",
      description: "Change your password to keep your account secure.",
      icon: KeyRound,
      actionLabel: "Change password",
      onClick: () => setOpen(true),
      variant: "primary" as const,
      disabled: false,
    },
    {
      title: "Two-Factor Authentication",
      description: "Add an extra layer of security to your account.",
      icon: ShieldCheck,
      actionLabel: "Coming soon",
      disabled: true,
    },
    {
      title: "Active Sessions",
      description: "Manage devices currently logged into your account.",
      icon: Lock,
      actionLabel: "View sessions",
      disabled: true,
    },
  ];

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
        <DashboardSectionCard className="space-y-4 p-5 sm:p-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">
              Security controls
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Manage core account security settings and protective access
              options.
            </p>
          </div>

          <div className="space-y-4">
            {items.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className={cn(
                    DASHBOARD_PAGE_SURFACE_CLASS,
                    "p-4 transition-colors duration-200 hover:border-sky-400/30",
                  )}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-500/10 text-sky-700 dark:text-sky-200">
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-950 dark:text-white">
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant={
                        item.variant === "primary" ? "default" : "outline"
                      }
                      className={
                        item.variant === "primary"
                          ? "btn-primary rounded-xl px-4"
                          : "rounded-xl border-border/60 bg-white/75 text-slate-700 hover:bg-white/90 hover:text-slate-950 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08] dark:hover:text-white"
                      }
                      onClick={item.onClick}
                      disabled={item.disabled}
                    >
                      {item.actionLabel}
                      {!item.disabled ? (
                        <ArrowUpRight className="ml-2 h-4 w-4" />
                      ) : null}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </DashboardSectionCard>

        <div className="space-y-6">
          <DashboardSectionCard className="hidden space-y-4 p-5 sm:p-6">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">
                Security posture
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Your account protections and operational guidance at a glance.
              </p>
            </div>

            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
              <div
                className={cn(DASHBOARD_PAGE_SURFACE_CLASS, "p-4 leading-6")}
              >
                Password changes are validated against your current session
                before any account credential update is accepted.
              </div>
              <div
                className={cn(DASHBOARD_PAGE_SURFACE_CLASS, "p-4 leading-6")}
              >
                Multi-factor authentication and session management can be
                layered in here without splitting your security experience
                across unrelated screens.
              </div>
            </div>
          </DashboardSectionCard>

          <DashboardSectionCard className="space-y-4 p-5 sm:p-6">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">
                Session control
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                End access across other devices when additional controls are
                enabled.
              </p>
            </div>

            <div>
              <Button
                variant="destructive"
                className="w-full rounded-xl"
                disabled
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out of all sessions
              </Button>
            </div>
          </DashboardSectionCard>

          <DashboardSectionCard>
            <div className="flex flex-col gap-4 rounded-xl border border-red-500/20 bg-red-500/[0.04] p-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10">
                  <UserRoundX className="size-5 text-red-400" />
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">
                    Close My Account
                  </p>

                  <p className="max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                    Permanently delete your account if you have no financial
                    records, or deactivate it if financial records must be
                    retained.
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="destructive"
                className="shrink-0 uppercase"
                onClick={() => {
                  setClosureError(null);
                  setCloseAccountOpen(true);
                }}
              >
                Close account
              </Button>
            </div>
          </DashboardSectionCard>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-border/60 bg-white/96 text-slate-950 shadow-[0_24px_70px_rgba(15,23,42,0.22)] sm:max-w-lg dark:border-white/10 dark:bg-[#0b1728]/96 dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-slate-950 dark:text-white">
              Change Password
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>

          <PasswordForm
            embedded
            onSuccess={() => setOpen(false)}
            siteName={siteName}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={closeAccountOpen}
        onOpenChange={(nextOpen) => {
          if (isClosingAccount) return;
          setCloseAccountOpen(nextOpen);
          if (!nextOpen) setClosureError(null);
        }}
      >
        <DialogContent className="max-h-[92dvh] w-[min(96vw,32rem)] overflow-y-auto !rounded-[1.75rem] !border-slate-200/80 !bg-none !bg-white/95 !p-6 !text-slate-950 !shadow-[0_24px_70px_rgba(15,23,42,0.18)] dark:!border-white/10 dark:!bg-zinc-950/95 dark:!text-white dark:!shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
          <DialogHeader>
            <div className="mb-2 flex size-11 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10">
              <AlertTriangle className="size-5 text-red-500 dark:text-red-400" />
            </div>

            <DialogTitle>Close your account?</DialogTitle>

            <DialogDescription className="text-slate-600 dark:text-slate-400">
              You are about to close your {resolvedSiteName} account. This
              action will end your access to the account.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
              What happens when you continue?
            </p>

            <ul className="space-y-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
              <li>
                • If you have no financial records, your account will be
                permanently deleted.
              </li>
              <li>
                • If financial records exist, your account will be deactivated
                and those records will be retained.
              </li>
              <li>
                • You will be signed out and will no longer be able to sign in.
              </li>
              <li>
                • Deactivated accounts may request reinstatement through{" "}
                {resolvedSiteName} support, subject to review and approval.
              </li>
            </ul>
          </div>

          {closureError && (
            <p
              role="alert"
              className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300"
            >
              {closureError}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={isClosingAccount}
              onClick={() => setCloseAccountOpen(false)}
              className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-600 dark:border-white/10 dark:bg-zinc-900 dark:text-slate-200 dark:hover:bg-white/[0.08]"
            >
              Keep my account
            </Button>

            <Button
              type="button"
              variant="destructive"
              disabled={isClosingAccount}
              onClick={handleCloseAccount}
            >
              {isClosingAccount
                ? "Closing account..."
                : "Confirm account closure"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
