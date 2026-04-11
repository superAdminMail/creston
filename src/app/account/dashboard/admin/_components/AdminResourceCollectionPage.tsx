import { Card, CardContent } from "@/components/ui/card";
import type { DashboardResourceCollection } from "@/lib/services/dashboard/dashboardResourceService";
import {
  AdminOperationsShell,
  type AdminOperationsStat,
} from "./AdminOperationsShell";
import { AdminResponsiveCollectionShell } from "./AdminResponsiveCollectionShell";

type AdminResourceCollectionPageProps = {
  title: string;
  description: string;
  collection: DashboardResourceCollection;
};

function MobileResourceCard({
  title,
  subtitle,
  meta,
}: DashboardResourceCollection["items"][number]) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-base font-semibold text-white">{title}</p>
        <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
      </div>
      <p className="text-xs leading-6 text-slate-500">{meta}</p>
    </div>
  );
}

export function AdminResourceCollectionPage({
  title,
  description,
  collection,
}: AdminResourceCollectionPageProps) {
  const stats: AdminOperationsStat[] = [
    {
      title: "Total records",
      value: String(collection.total),
      hint: `${collection.label} currently available in the system`,
    },
  ];

  return (
    <AdminOperationsShell title={title} description={description} stats={stats}>
      <AdminResponsiveCollectionShell
        items={collection.items}
        getItemKey={(item) => item.id}
        renderMobileCard={(item) => <MobileResourceCard {...item} />}
        emptyState={
          <Card className="rounded-[1.75rem] border border-white/10 bg-white/5 text-center">
            <CardContent className="space-y-3 p-8">
              <h2 className="text-lg font-semibold text-white">
                No {collection.label.toLowerCase()} found
              </h2>
              <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-400">
                Records for this operational route will appear here once they
                are available.
              </p>
            </CardContent>
          </Card>
        }
        columns={[
          {
            key: "title",
            header: "Primary record",
            render: (item) => (
              <div>
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-xs text-slate-400">{item.subtitle}</p>
              </div>
            ),
          },
          {
            key: "meta",
            header: "Operational detail",
            render: (item) => (
              <p className="text-sm leading-6 text-slate-300">{item.meta}</p>
            ),
          },
          {
            key: "id",
            header: "Reference",
            render: (item) => (
              <code className="text-xs text-slate-500">
                {item.id.slice(0, 8).toUpperCase()}
              </code>
            ),
          },
        ]}
      />
    </AdminOperationsShell>
  );
}
