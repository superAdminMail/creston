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
        return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
      case "PENDING":
        return "border-amber-400/20 bg-amber-400/10 text-amber-300";
      case "FROZEN":
        return "border-slate-300/20 bg-slate-400/10 text-slate-200";
      case "CLOSED":
        return "border-rose-400/20 bg-rose-400/10 text-rose-300";
      default:
        return "border-white/10 bg-white/[0.04] text-slate-200";
    }
  })();

  return (
    <Badge variant="secondary" className={cn("border", classes)}>
      {status}
    </Badge>
  );
}
