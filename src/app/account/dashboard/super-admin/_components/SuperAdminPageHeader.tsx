import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

type SuperAdminPageHeaderProps = {
  backHref: string;
  backLabel: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export function SuperAdminPageHeader({
  backHref,
  backLabel,
  title,
  description,
  actions,
}: SuperAdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <Link
          href={backHref}
          className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-sky-700 transition hover:text-sky-900 dark:text-sky-300 dark:hover:text-sky-100"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl dark:text-white">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base dark:text-slate-400">
          {description}
        </p>
      </div>

      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
