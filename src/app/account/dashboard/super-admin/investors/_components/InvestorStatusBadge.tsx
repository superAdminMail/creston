import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function InvestorStatusBadge({
  status,
}: {
  status: "NOT_STARTED" | "PENDING_REVIEW" | "VERIFIED" | "REJECTED" | string;
}) {
  const classes = (() => {
    switch (status) {
      case "VERIFIED":
        return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
      case "PENDING_REVIEW":
        return "border-amber-400/20 bg-amber-400/10 text-amber-300";
      case "REJECTED":
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
