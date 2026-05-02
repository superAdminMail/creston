"use client";

import { useState } from "react";
import { ArrowUpRight, KeyRound, Lock, LogOut, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
        <Card className="border-white/8 bg-[#08101d]/96 text-white shadow-[0_24px_70px_rgba(2,6,23,0.28)]">
          <CardHeader>
            <CardTitle>Security controls</CardTitle>
            <CardDescription>
              Manage core account security settings and protective access options.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-[1.35rem] border border-white/8 bg-white/[0.03] p-4 transition-colors duration-200 hover:border-white/12 hover:bg-white/[0.04]"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-400/15 bg-blue-400/10 text-blue-200">
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{item.title}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-400">
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
                          : "rounded-xl border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.05] hover:text-white"
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
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-white/8 bg-[#08101d]/96 text-white shadow-[0_24px_70px_rgba(2,6,23,0.28)]">
            <CardHeader>
              <CardTitle>Security posture</CardTitle>
              <CardDescription>
                Your account protections and operational guidance at a glance.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-300">
              <div className="rounded-[1.35rem] border border-white/8 bg-white/[0.03] p-4 leading-6">
                Password changes are validated against your current session before
                any account credential update is accepted.
              </div>
              <div className="rounded-[1.35rem] border border-white/8 bg-white/[0.03] p-4 leading-6">
                Multi-factor authentication and session management can be layered
                in here without splitting your security experience across
                unrelated screens.
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/8 bg-[#08101d]/96 text-white shadow-[0_24px_70px_rgba(2,6,23,0.28)]">
            <CardHeader>
              <CardTitle>Session control</CardTitle>
              <CardDescription>
                End access across other devices when additional controls are enabled.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                className="w-full rounded-xl"
                disabled
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out of all sessions
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-white/10 bg-[#08101d]/98 text-white shadow-[0_24px_70px_rgba(2,6,23,0.32)] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Change Password</DialogTitle>
            <DialogDescription className="text-slate-400">
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
