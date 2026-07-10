import { cn } from "@/lib/utils";

type InvestmentPlanStatusBadgeProps = {
  isActive: boolean;
};

export function InvestmentPlanStatusBadge({
  isActive,
}: InvestmentPlanStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
        isActive
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-700 dark:text-emerald-300"
          : "border-slate-200/80 bg-slate-50/80 text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300",
      )}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}
