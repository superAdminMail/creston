import Link from "next/link";
import { ArrowRight, PencilLine } from "lucide-react";

import type {
  SuperAdminInvestorListItem,
  SuperAdminInvestorsPageData,
} from "@/actions/super-admin/investors/getSuperAdminInvestors";
import { SuperAdminCollection } from "../../_components/SuperAdminCollection";
import { InvestorsEmptyState } from "./InvestorsEmptyState";
import { InvestorStatusBadge } from "./InvestorStatusBadge";

type InvestorsTableProps = {
  data: SuperAdminInvestorsPageData;
};

function InvestorActions({ investor }: { investor: SuperAdminInvestorListItem }) {
  return (
    <div className="flex flex-col gap-3 xl:w-[13rem]">
      <Link
        href={`/account/dashboard/super-admin/investors/${investor.id}`}
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/[0.07] hover:text-white"
      >
        View details
        <ArrowRight className="h-4 w-4" />
      </Link>
      <Link
        href={`/account/dashboard/super-admin/investors/${investor.id}/edit`}
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/8 bg-transparent px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-white/12 hover:bg-white/[0.04] hover:text-white"
      >
        <PencilLine className="h-4 w-4" />
        Edit
      </Link>
    </div>
  );
}

function InvestorMobileCard({ investor }: { investor: SuperAdminInvestorListItem }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold text-white">{investor.name}</h2>
        <InvestorStatusBadge status={investor.kycStatus} />
        {investor.isVerified ? (
          <span className="inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
            Verified
          </span>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Email</p>
          <p className="mt-2 text-sm font-medium text-white">{investor.email}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Username</p>
          <p className="mt-2 text-sm font-medium text-white">{investor.username}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Accounts
          </p>
          <p className="mt-2 text-sm font-medium text-white">
            {investor.investmentAccountsCount + investor.savingsAccountsCount}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Location
          </p>
          <p className="mt-2 text-sm font-medium text-white">
            {investor.city}
          </p>
        </div>
      </div>

      <InvestorActions investor={investor} />
    </div>
  );
}

export function InvestorsTable({ data }: InvestorsTableProps) {
  if (data.investors.length === 0) {
    return <InvestorsEmptyState />;
  }

  return (
    <SuperAdminCollection
      items={data.investors}
      getItemKey={(investor) => investor.id}
      renderMobileCard={(investor) => <InvestorMobileCard investor={investor} />}
      columns={[
        {
          key: "investor",
          header: "Investor",
          render: (investor) => (
            <div>
              <p className="text-sm font-semibold text-white">{investor.name}</p>
              <p className="mt-1 text-xs text-slate-400">
                {investor.email} • {investor.username}
              </p>
            </div>
          ),
        },
        {
          key: "kyc",
          header: "KYC",
          render: (investor) => (
            <div className="space-y-2">
              <InvestorStatusBadge status={investor.kycStatus} />
              <p className="text-xs text-slate-400">
                {investor.isVerified ? "Verified" : "Not verified"}
              </p>
            </div>
          ),
        },
        {
          key: "accounts",
          header: "Accounts",
          render: (investor) => (
            <span className="text-sm text-slate-200">
              {investor.investmentAccountsCount + investor.savingsAccountsCount}
            </span>
          ),
        },
        {
          key: "location",
          header: "Location",
          render: (investor) => (
            <span className="text-sm text-slate-200">
              {investor.city}, {investor.country}
            </span>
          ),
        },
        {
          key: "updated",
          header: "Updated",
          render: (investor) => (
            <span className="text-sm text-slate-200">{investor.updatedDate}</span>
          ),
        },
        {
          key: "actions",
          header: "Actions",
          className: "px-5 py-4 text-right text-slate-400",
          cellClassName: "px-5 py-4 align-top",
          render: (investor) => <InvestorActions investor={investor} />,
        },
      ]}
    />
  );
}
