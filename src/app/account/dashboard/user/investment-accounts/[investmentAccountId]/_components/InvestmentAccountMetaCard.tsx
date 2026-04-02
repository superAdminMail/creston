import type { InvestmentAccountDetailsViewModel } from "@/actions/investment-account/getInvestmentAccountDetails";

export function InvestmentAccountMetaCard({
  account,
}: {
  account: InvestmentAccountDetailsViewModel;
}) {
  const rows = [
    { label: "Opened date", value: account.openedAt },
    { label: "Closed date", value: account.closedAt },
    { label: "Created date", value: account.createdAt },
    { label: "Updated date", value: account.updatedAt },
    { label: "Account status", value: account.statusLabel },
  ];

  return (
    <section className="card-premium rounded-[2rem] p-6">
      <h2 className="text-lg font-semibold text-white">Account metadata</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        Lifecycle and servicing information for this investment account.
      </p>

      <div className="mt-5 space-y-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-start justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3"
          >
            <span className="text-sm text-slate-400">{row.label}</span>
            <span className="text-right text-sm font-medium text-white">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
