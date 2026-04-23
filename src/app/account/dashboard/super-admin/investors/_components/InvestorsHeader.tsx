import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function InvestorsHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Link
          href="/account/dashboard/super-admin"
          className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
          Investors
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
          Review investor profiles, verification state, and linked account
          activity from one super-admin workspace.
        </p>
      </div>
    </div>
  );
}
