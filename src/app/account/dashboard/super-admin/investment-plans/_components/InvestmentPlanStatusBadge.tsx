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
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
          : "border-slate-400/20 bg-slate-400/10 text-slate-300",
      )}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}
