import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { getDashboardCollectionsForRole } from "@/lib/services/dashboard/dashboardResourceService";

export default async function SuperAdminDashboardPage() {
  const collections = await getDashboardCollectionsForRole("SUPER_ADMIN");

  return (
    <div className="space-y-6">
      <section className="card-premium rounded-[2rem] p-6 sm:p-8">
        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
          Super Admin Control
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">
          Oversee Havenstone&apos;s operating data across users, roles, investor
          records, accounts, and order flows through one shared service layer.
        </p>
      </section>

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
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{item.subtitle}</p>
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
    </div>
  );
}
