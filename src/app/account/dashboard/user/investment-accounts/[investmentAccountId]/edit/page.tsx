import { notFound } from "next/navigation";

import { getInvestmentAccountDetails } from "@/actions/investment-account/getInvestmentAccountDetails";
import { UpdateInvestmentAccountForm } from "../../../_components/UpdateInvestmentAccountForm";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page(props: PageProps) {
  const { id } = await props.params;
  const account = await getInvestmentAccountDetails(id);

  if (!account) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Manage account</h1>
        <p className="text-sm text-muted-foreground">
          Update account status using the current investment plan model and
          lifecycle rules.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-2">
        <p className="text-sm font-medium text-white">{account.title}</p>
        <p className="text-xs text-muted-foreground">
          {account.investment.name} - {account.investment.typeLabel}
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="inline-flex rounded-full border border-sky-400/20 bg-sky-400/10 px-2.5 py-1 text-xs font-medium text-sky-200">
            {account.plan.investmentModelLabel}
          </span>
          <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-slate-200">
            {account.plan.periodLabel}
          </span>
          <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-slate-200">
            Status: {account.statusLabel}
          </span>
        </div>
      </div>

      <UpdateInvestmentAccountForm
        accountId={account.id}
        currentStatus={account.status}
      />
    </div>
  );
}
