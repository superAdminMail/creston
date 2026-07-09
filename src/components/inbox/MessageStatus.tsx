import { Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  deliveredAt?: string | null;
  readAt?: string | null;
  sent?: boolean;
  isSender?: boolean;
  className?: string;
};

export function MessageStatus({
  deliveredAt,
  readAt,
  sent,
  isSender = false,
  className,
}: Props) {
  if (readAt) {
    return (
      <CheckCheck
        className={cn(
          "h-3.5 w-3.5",
          isSender ? "text-white/85" : "text-[#3c9ee0]",
          className,
        )}
        strokeWidth={2.3}
      />
    );
  }

  if (deliveredAt || sent) {
    return (
      <Check
        className={cn(
          "h-3.5 w-3.5",
          isSender ? "text-white/75" : "text-slate-500 dark:text-muted-foreground",
          className,
        )}
        strokeWidth={2.3}
      />
    );
  }

  return null;
}
