import type { InvestmentAccountDetailsViewModel } from "@/actions/investment-account/getInvestmentAccountDetails";
import { cn } from "@/lib/utils";

export function InvestmentAccountActivityCard({
  account,
}: {
  account: InvestmentAccountDetailsViewModel;
}) {
  return (
    <section className="card-premium rounded-[2rem] p-6">
      <h2 className="text-lg font-semibold text-white">Account activity</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        A concise timeline of key account lifecycle events.
      </p>

      <div className="mt-5 space-y-4">
        {account.timeline.map((item, index) => (
          <div key={item.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "mt-1 h-3 w-3 rounded-full",
                  item.tone === "positive"
                    ? "bg-emerald-300"
                    : item.tone === "subtle"
                      ? "bg-slate-500"
                      : "bg-blue-300",
                )}
              />
              {index < account.timeline.length - 1 ? (
                <span className="mt-2 h-full w-px bg-white/10" />
              ) : null}
            </div>

            <div className="pb-4">
              <p className="text-sm font-medium text-white">{item.label}</p>
              <p className="mt-1 text-sm text-slate-400">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
