import { Inbox } from "lucide-react";

export default function SupportInboxEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-200/80 bg-white/75 px-5 py-12 text-center dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-200/70 bg-sky-50 text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300">
        <Inbox className="h-5 w-5" />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-slate-950 dark:text-white">
        No support tickets found
      </h3>

      <p className="mt-1 max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-400">
        No support tickets match your current filters. Try changing your search
        or selecting another filter.
      </p>
    </div>
  );
}
