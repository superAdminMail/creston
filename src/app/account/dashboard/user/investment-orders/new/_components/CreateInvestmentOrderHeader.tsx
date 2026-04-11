import Link from "next/link";
import { ArrowLeft, Landmark, Plus } from "lucide-react";

export function CreateInvestmentOrderHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Link
          href="/account/dashboard/user"
          className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/15 bg-blue-400/8 px-3 py-1 text-xs font-medium text-blue-200">
          <Plus className="h-3.5 w-3.5" />
          New investment order
        </div>

        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
          Create Investment Order
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">
          Choose an investment type, select a structured Havenstone plan, and
          submit a secure investment order for payment review and confirmation.
        </p>
      </div>

      <div className="inline-flex items-center gap-3 rounded-3xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
        <Landmark className="h-4 w-4 text-blue-300" />
        Order workflow
      </div>
    </div>
  );
}
