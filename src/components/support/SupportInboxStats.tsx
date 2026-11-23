import { Card, CardContent } from "@/components/ui/card";
import type { SupportInboxMode } from "@/lib/support/supportConversationView";

type Props = {
  mode: SupportInboxMode;
  stats: {
    total: number;
    unread: number;
    open: number;
    waiting: number;
  };
};

export default function SupportInboxStats({ mode, stats }: Props) {
  const isStaffView = mode === "staff";

  const items = isStaffView
    ? [
        { label: "Total tickets", value: stats.total },
        { label: "Unread", value: stats.unread },
        { label: "Open", value: stats.open },
        { label: "Pending", value: stats.waiting },
      ]
    : [
        { label: "Open threads", value: stats.open },
        { label: "Unread replies", value: stats.unread },
      ];

  return (
    <Card className="text-slate-950 dark:text-white">
      <CardContent className="p-5">
        <div
          className={`grid gap-3 ${
            isStaffView ? "grid-cols-2" : "grid-cols-2"
          }`}
        >
          {items.map((item) => (
            <div
              key={item.label}
              className="rounded-[1.4rem] border border-slate-200/80 bg-white/75 p-4 dark:border-white/10 dark:bg-white/[0.04]"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-slate-600 dark:text-slate-500">
                {item.label}
              </p>

              <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
