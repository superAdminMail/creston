import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { SuperAdminInvestorDetailsViewModel } from "@/actions/super-admin/investors/getSuperAdminInvestorById";
import { SuperAdminSectionCard } from "../../_components/SuperAdminSectionCard";

export function InvestorDetailsCard({
  investor,
}: {
  investor: SuperAdminInvestorDetailsViewModel;
}) {
  return (
    <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card className="rounded-[1.75rem] border-slate-200/80 bg-white/90 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.94),rgba(5,11,31,0.98))]">
        <CardHeader className="space-y-4 p-5 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle className="min-w-0 text-2xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-3xl dark:text-white">
              {investor.title}
            </CardTitle>
            <span className="inline-flex items-center rounded-full border border-slate-200/80 bg-slate-50/80 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
              {investor.isVerified ? "Verified" : "Not verified"}
            </span>
          </div>
          <CardDescription className="text-sm leading-7 text-slate-600 dark:text-slate-400">
            {investor.owner.email}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 px-5 pb-5 sm:px-8 sm:pb-8">
          <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[
              ["Phone", investor.profile.phoneNumber],
              ["KYC status", investor.kycStatusLabel],
              ["Updated", investor.timeline[1]?.value ?? "Not available"],
              ["Investment accounts", investor.counts.investmentAccounts],
              ["Savings accounts", investor.counts.savingsAccounts],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 shadow-sm dark:border-white/8 dark:bg-white/[0.03]"
              >
                <dt className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  {label}
                </dt>
                <dd className="mt-2 break-words text-sm font-medium text-slate-950 dark:text-white">
                  {String(value)}
                </dd>
              </div>
            ))}
          </dl>

          <SuperAdminSectionCard
            title="Contact details"
            description="Identity and address fields for this investor profile."
            className="rounded-[1.5rem] border-slate-200/70 bg-slate-50/80 shadow-none dark:border-white/8 dark:bg-white/[0.03]"
            headerClassName="space-y-2 p-5"
            contentClassName="p-5 pt-0"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Country", investor.profile.country],
                ["State", investor.profile.state],
                ["City", investor.profile.city],
                [
                  "Address",
                  `${investor.profile.addressLine1}${
                    investor.profile.addressLine2 !== "Not set"
                      ? `, ${investor.profile.addressLine2}`
                      : ""
                  }`,
                ],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                    {label}
                  </p>
                  <p className="mt-2 break-words text-sm text-slate-950 dark:text-white">
                    {String(value)}
                  </p>
                </div>
              ))}
            </div>
          </SuperAdminSectionCard>
        </CardContent>
      </Card>

      <aside className="space-y-6">
        <SuperAdminSectionCard
          title="Profile controls"
          description="Use the edit page to update identity fields and review state."
          className="rounded-[1.75rem] border-slate-200/80 bg-white/90 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.94),rgba(5,11,31,0.98))]"
          headerClassName="space-y-2 p-5 sm:p-6"
          contentClassName="p-5 pt-0 sm:p-6 sm:pt-0"
        >
          <Link
            href={`/account/dashboard/super-admin/investors/${investor.id}/edit`}
            className="btn-primary inline-flex h-11 w-full items-center justify-center rounded-xl px-5 text-sm font-semibold"
          >
            Edit investor
          </Link>
        </SuperAdminSectionCard>

        <SuperAdminSectionCard
          title="Quick links"
          description="Jump to the related super-admin account trees."
          className="rounded-[1.75rem] border-slate-200/80 bg-white/90 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.94),rgba(5,11,31,0.98))]"
          headerClassName="space-y-2 p-5 sm:p-6"
          contentClassName="space-y-3 p-5 pt-0 sm:p-6 sm:pt-0"
        >
          <Link
            href="/account/dashboard/super-admin/investment-accounts"
            className="block rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-white hover:text-slate-950 dark:border-white/8 dark:bg-white/[0.02] dark:text-slate-200 dark:hover:border-white/12 dark:hover:bg-white/[0.05] dark:hover:text-white"
          >
            View investment accounts
          </Link>
          <Link
            href="/account/dashboard/super-admin/savings-accounts"
            className="block rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-white hover:text-slate-950 dark:border-white/8 dark:bg-white/[0.02] dark:text-slate-200 dark:hover:border-white/12 dark:hover:bg-white/[0.05] dark:hover:text-white"
          >
            View savings accounts
          </Link>
        </SuperAdminSectionCard>
      </aside>
    </section>
  );
}
