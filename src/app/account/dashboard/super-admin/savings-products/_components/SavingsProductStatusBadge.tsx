import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function SavingsProductStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "border",
        isActive
          ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
          : "border-slate-400/20 bg-slate-500/10 text-slate-300",
      )}
    >
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}
