import { Badge } from "@/components/ui/badge";
import { SuperAdminStatCard } from "@/app/account/dashboard/super-admin/_components/SuperAdminStatCard";
import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";
import { formatBytes, formatDateLabel } from "@/lib/formatters/formatters";
import { findOrphanImageAssets } from "@/lib/file-assets/findOrphanImageAssets";
import { logAuditEvent } from "@/lib/audit/logAuditEvent";

import { OrphanImageCleanupWorkspace } from "./_components/OrphanImageCleanupWorkspace";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function resolveSearchParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function readNumber(value: string | undefined) {
  if (!value) return undefined;

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
}

function formatAnalyticsCount(value: number) {
  return value.toLocaleString("en-US");
}

export default async function SuperAdminStoragePage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const { userId } = await requireSuperAdminAccess();
  const resolvedSearchParams = (await searchParams) ?? {};

  const olderThanDaysRaw = resolveSearchParam(
    resolvedSearchParams.olderThanDays,
  );
  const limitRaw = resolveSearchParam(resolvedSearchParams.limit);
  const provider = resolveSearchParam(resolvedSearchParams.provider);
  const type = resolveSearchParam(resolvedSearchParams.type);

  const preview = await findOrphanImageAssets({
    olderThanDays: readNumber(olderThanDaysRaw),
    limit: readNumber(limitRaw),
    provider,
    type,
  });

  await logAuditEvent({
    actorUserId: userId,
    action: "ORPHAN_IMAGE_CLEANUP_DRY_RUN",
    entityType: "FileAsset",
    description: `Viewed orphan image cleanup preview for ${preview.totalFoundInBatch} asset(s).`,
    metadata: {
      olderThanDays: preview.olderThanDays,
      limit: preview.limit,
      provider,
      type,
      totalFoundInBatch: preview.totalFoundInBatch,
      estimatedSizeBytes: preview.estimatedSizeBytes,
      oldestCreatedAt: preview.oldestCreatedAt,
      providerBreakdown: preview.providerBreakdown,
      assetIds: preview.assets.map((asset) => asset.id),
    },
  });

  const oldestOrphanLabel = preview.oldestCreatedAt
    ? formatDateLabel(preview.oldestCreatedAt, "Not available")
    : "Not available";

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-6">
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,#111827_0%,#0f3d5e_44%,#0f766e_100%)] shadow-[0_22px_70px_rgba(15,23,42,0.22)]">
        <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between lg:p-10">
          <div className="space-y-3">
            <Badge className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white">
              System Monitoring
            </Badge>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">
                Storage Cleanup
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-slate-200/90 sm:text-base">
                Clean up orphaned image assets from your storage.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Badge className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white">
              Older than {preview.olderThanDays} days
            </Badge>
            <Badge className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white">
              Batch limit {formatAnalyticsCount(preview.limit)}
            </Badge>
            <Badge className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white">
              Safety window active
            </Badge>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SuperAdminStatCard
          label="Orphaned images"
          value={formatAnalyticsCount(preview.totalFoundInBatch)}
          description={`Older than ${preview.olderThanDays} day${preview.olderThanDays === 1 ? "" : "s"}.`}
        />
        <SuperAdminStatCard
          label="Estimated size"
          value={formatBytes(preview.estimatedSizeBytes)}
          description="Approximate total storage footprint in the current preview."
        />
        <SuperAdminStatCard
          label="Oldest orphan"
          value={oldestOrphanLabel}
          description="Oldest candidate currently in the preview batch."
        />
        <SuperAdminStatCard
          label="Providers"
          value={formatAnalyticsCount(preview.providerBreakdown.length)}
          description="Distinct storage providers represented in the current batch."
        />
      </section>

      <section className="rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.94),rgba(5,11,31,0.98))] sm:p-6">
        <OrphanImageCleanupWorkspace
          initialPreview={preview}
          initialOlderThanDaysRaw={olderThanDaysRaw ?? null}
          initialLimitRaw={limitRaw ?? null}
          initialProvider={provider ?? null}
          initialType={type ?? null}
          endpoint="/api/super-admin/file-assets/orphans"
        />
      </section>
    </main>
  );
}
