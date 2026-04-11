import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { DashboardResourceCollection } from "@/lib/services/dashboard/dashboardResourceService";

export type AdminOperationsStat = {
  title: string;
  value: string;
  hint: string;
};

type AdminOperationsShellProps = {
  title: string;
  description: string;
  collections?: DashboardResourceCollection[];
  stats?: AdminOperationsStat[];
  children?: ReactNode;
};

export function AdminOperationsShell({
  title,
  description,
  collections,
  stats,
  children,
}: AdminOperationsShellProps) {
  return (
    <div className="space-y-6">
      <section className="card-premium rounded-[2rem] p-6 sm:p-8">
        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">
          {description}
        </p>
      </section>

      {stats?.length ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <Card
              key={stat.title}
              className="rounded-[1.75rem] border border-white/10 bg-white/5"
            >
              <CardContent className="space-y-2 p-5">
                <p className="text-sm text-slate-400">{stat.title}</p>
                <p className="text-2xl font-semibold text-white">
                  {stat.value}
                </p>
                <p className="text-xs leading-6 text-slate-500">{stat.hint}</p>
              </CardContent>
            </Card>
          ))}
        </section>
      ) : null}

      {children}

      {collections?.length ? (
        <section className="grid gap-6 xl:grid-cols-2">
          {collections.map((collection) => (
            <article
              key={collection.href}
              className="card-premium rounded-[1.75rem] p-6 sm:p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {collection.label}
                  </h2>
                  <p className="mt-2 text-sm text-slate-400">
                    {collection.total} record{collection.total === 1 ? "" : "s"}
                  </p>
                </div>

                <Link
                  href={collection.href}
                  className="inline-flex items-center gap-2 text-sm font-medium text-blue-200 transition hover:text-white"
                >
                  Open route
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-5 space-y-3">
                {collection.items.length ? (
                  collection.items.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3"
                    >
                      <p className="text-sm font-medium text-white">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        {item.subtitle}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">{item.meta}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-5 text-sm text-slate-400">
                    No records found for this route yet.
                  </div>
                )}
              </div>
            </article>
          ))}
        </section>
      ) : null}
    </div>
  );
}
