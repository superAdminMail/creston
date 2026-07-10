import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function SavingsProductStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "border",
        isActive
          ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "border-slate-200/80 bg-slate-50/80 text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300",
      )}
    >
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}
