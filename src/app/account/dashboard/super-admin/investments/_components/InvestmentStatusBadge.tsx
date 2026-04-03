import { cn } from "@/lib/utils";

type InvestmentStatusBadgeProps = {
  label: string;
  status: string;
};

export function InvestmentStatusBadge({
  label,
  status,
}: InvestmentStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
        status === "ACTIVE" &&
          "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
        status === "DRAFT" &&
          "border-amber-400/20 bg-amber-400/10 text-amber-300",
        status === "INACTIVE" &&
          "border-slate-400/20 bg-slate-400/10 text-slate-300",
        status === "ARCHIVED" &&
          "border-rose-400/20 bg-rose-400/10 text-rose-300",
      )}
    >
      {label}
    </span>
  );
}
