import Link from "next/link";
import { AlertTriangle, ArrowLeft, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AccountSuspendedLogoutButton } from "./_components/AccountSuspendedLogoutButton";

export default function AccountSuspendedPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-7rem)] w-full max-w-4xl items-center px-4 py-6 sm:px-6 lg:px-8">
      <Card className="w-full rounded-[2rem] border border-slate-200/80 bg-white/92 text-slate-950 shadow-[0_24px_60px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-950/92 dark:text-white dark:shadow-[0_24px_60px_rgba(2,6,23,0.25)]">
        <CardContent className="space-y-6 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-200/70 bg-amber-50 text-amber-700 shadow-sm dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300">
              <AlertTriangle className="h-5 w-5" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/75 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                Account suspended
              </div>
              <h1 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white sm:text-3xl">
                Your account is temporarily suspended
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">
                Contact support to reactivate your account. Once the suspension
                is reviewed and lifted, you can sign in again normally.
              </p>
            </div>
          </div>

          <div className="grid gap-3 rounded-[1.4rem] border border-slate-200/80 bg-slate-50 p-4 text-sm text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-sky-700 dark:text-sky-300" />
              <span>Need help? Reach out to support for reactivation.</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              We&apos;ve paused dashboard access until the account review is
              complete.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              className="rounded-full bg-[#3c9ee0] px-5 text-white hover:bg-[#2f8bd0]"
            >
              <Link href="/contact">
                <Mail className="mr-2 h-4 w-4" />
                Contact support
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="rounded-full border-slate-200 bg-white px-5 text-slate-700 hover:bg-slate-50 hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08]"
            >
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to home
              </Link>
            </Button>

            <AccountSuspendedLogoutButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
