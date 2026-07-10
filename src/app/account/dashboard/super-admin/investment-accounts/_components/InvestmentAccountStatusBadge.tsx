import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function InvestmentAccountStatusBadge({
  status,
}: {
  status: "PENDING" | "ACTIVE" | "FROZEN" | "CLOSED" | string;
}) {
  const classes = (() => {
    switch (status) {
      case "ACTIVE":
        return "border-emerald-400/20 bg-emerald-400/10 text-emerald-700 dark:text-emerald-300";
      case "PENDING":
        return "border-amber-400/20 bg-amber-400/10 text-amber-700 dark:text-amber-300";
      case "FROZEN":
        return "border-slate-300/70 bg-slate-100/80 text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200";
      case "CLOSED":
        return "border-rose-400/20 bg-rose-400/10 text-rose-700 dark:text-rose-300";
      default:
        return "border-slate-200/80 bg-slate-50/80 text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200";
    }
  })();

  return (
    <Badge variant="secondary" className={cn("border", classes)}>
      {status}
    </Badge>
  );
}
