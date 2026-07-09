"use client";

import { useState } from "react";
import { ArrowUpRight, KeyRound, Lock, LogOut, ShieldCheck } from "lucide-react";

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

type SecuritySectionProps = {
  siteName?: string;
};

export default function SecuritySection({ siteName }: SecuritySectionProps) {
  const [open, setOpen] = useState(false);

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
              Manage core account security settings and protective access options.
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
                      variant={item.variant === "primary" ? "default" : "outline"}
                      className={
                        item.variant === "primary"
                          ? "btn-primary rounded-xl px-4"
                          : "rounded-xl border-border/60 bg-white/75 text-slate-700 hover:bg-white/90 hover:text-slate-950 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08] dark:hover:text-white"
                      }
                      onClick={item.onClick}
                      disabled={item.disabled}
                    >
                      {item.actionLabel}
                      {!item.disabled ? <ArrowUpRight className="ml-2 h-4 w-4" /> : null}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </DashboardSectionCard>

        <div className="space-y-6">
          <DashboardSectionCard className="space-y-4 p-5 sm:p-6">
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
                className={cn(
                  DASHBOARD_PAGE_SURFACE_CLASS,
                  "p-4 leading-6",
                )}
              >
                Password changes are validated against your current session before
                any account credential update is accepted.
              </div>
              <div
                className={cn(
                  DASHBOARD_PAGE_SURFACE_CLASS,
                  "p-4 leading-6",
                )}
              >
                Multi-factor authentication and session management can be layered
                in here without splitting your security experience across
                unrelated screens.
              </div>
            </div>
          </DashboardSectionCard>

          <DashboardSectionCard className="space-y-4 p-5 sm:p-6">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">
                Session control
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                End access across other devices when additional controls are enabled.
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
    </>
  );
}
