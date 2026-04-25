"use client";

import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatBytes,
  formatDateLabel,
  formatEnumLabel,
} from "@/lib/formatters/formatters";

import { OrphanImageCleanupClient } from "./OrphanImageCleanupClient";

type OrphanPreviewAsset = {
  id: string;
  originalName: string | null;
  fileName: string;
  mimeType: string | null;
  extension: string | null;
  type: string;
  visibility: string;
  storageProvider: string;
  storageKey: string;
  url: string | null;
  sizeBytes: number | null;
  createdAt: string;
  reason: "unreferenced_image_asset";
};

type OrphanPreview = {
  olderThanDays: number;
  limit: number;
  totalFoundInBatch: number;
  estimatedSizeBytes: number;
  oldestCreatedAt: string | null;
  providerBreakdown: Array<{
    provider: string;
    count: number;
    sizeBytes: number;
  }>;
  assets: OrphanPreviewAsset[];
};

type OrphanImageCleanupWorkspaceProps = {
  initialPreview: OrphanPreview;
  initialOlderThanDaysRaw?: string | null;
  initialLimitRaw?: string | null;
  initialProvider?: string | null;
  initialType?: string | null;
  endpoint: string;
};

const ALL_PROVIDER_VALUE = "__all_providers__";
const ALL_TYPE_VALUE = "__all_types__";

function formatAnalyticsCount(value: number) {
  return value.toLocaleString("en-US");
}

export function OrphanImageCleanupWorkspace({
  initialPreview,
  initialOlderThanDaysRaw,
  initialLimitRaw,
  initialProvider,
  initialType,
  endpoint,
}: OrphanImageCleanupWorkspaceProps) {
  const [preview, setPreview] = useState<OrphanPreview>(initialPreview);
  const [olderThanDays, setOlderThanDays] = useState(
    initialOlderThanDaysRaw ?? String(initialPreview.olderThanDays),
  );
  const [limit, setLimit] = useState(
    initialLimitRaw ?? String(initialPreview.limit),
  );
  const [provider, setProvider] = useState(initialProvider ?? "");
  const [type, setType] = useState(initialType ?? "");
  const [pageSize, setPageSize] = useState("6");
  const [currentPage, setCurrentPage] = useState(1);
  const [scanState, setScanState] = useState<
    "idle" | "scanning" | "scanned" | "error"
  >("idle");
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const providerSelectValue = provider || ALL_PROVIDER_VALUE;
  const typeSelectValue = type || ALL_TYPE_VALUE;

  const oldestOrphanLabel = preview.oldestCreatedAt
    ? formatDateLabel(preview.oldestCreatedAt, "Not available")
    : "Not available";

  const normalizedPageSize = Number(pageSize) || 6;
  const totalPages = Math.max(
    1,
    Math.ceil(preview.assets.length / normalizedPageSize),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * normalizedPageSize;
  const paginatedAssets = preview.assets.slice(
    startIndex,
    startIndex + normalizedPageSize,
  );
  const showingStart = preview.assets.length === 0 ? 0 : startIndex + 1;
  const showingEnd = Math.min(
    startIndex + normalizedPageSize,
    preview.assets.length,
  );

  async function handleScan() {
    setScanState("scanning");
    setScanError(null);
    setScanMessage(null);

    try {
      const params = new URLSearchParams();

      if (olderThanDays) params.set("olderThanDays", olderThanDays);
      if (limit) params.set("limit", limit);
      if (provider) params.set("provider", provider);
      if (type) params.set("type", type);

      const response = await fetch(
        `${endpoint}?${params.toString()}`,
        { method: "GET" },
      );

      const data = (await response.json()) as OrphanPreview | { error?: string };

      if (!response.ok) {
        setScanState("error");
        setScanError(
          "error" in data
            ? data.error ?? "Unable to scan preview."
            : "Unable to scan preview.",
        );
        return;
      }

      setPreview(data as OrphanPreview);
      setCurrentPage(1);
      setScanState("scanned");
      setScanMessage(
        `Scan completed with ${formatAnalyticsCount((data as OrphanPreview).totalFoundInBatch)} orphaned image(s).`,
      );
    } catch {
      setScanState("error");
      setScanError("Unable to scan orphan images right now.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
            Cleanup Controls
          </h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">
            Scan first, review the orphaned count, then delete only the scanned
            orphaned images.
          </p>
        </div>
        <Badge className="w-fit rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-100">
          Dry run preview
        </Badge>
      </div>

      <div className="grid gap-4 xl:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Older than days
          </label>
          <Input
            type="number"
            min={7}
            value={olderThanDays}
            onChange={(event) => setOlderThanDays(event.target.value)}
            className="h-11 rounded-2xl border-slate-200/80 bg-white/80 dark:border-white/10 dark:bg-white/5"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Batch limit
          </label>
          <Input
            type="number"
            min={1}
            max={200}
            value={limit}
            onChange={(event) => setLimit(event.target.value)}
            className="h-11 rounded-2xl border-slate-200/80 bg-white/80 dark:border-white/10 dark:bg-white/5"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Storage provider
          </label>
          <Select
            value={providerSelectValue}
            onValueChange={(value) =>
              setProvider(value === ALL_PROVIDER_VALUE ? "" : value)
            }
          >
            <SelectTrigger className="h-11 w-full rounded-2xl border-slate-200/80 bg-white/80 dark:border-white/10 dark:bg-white/5">
              <SelectValue placeholder="All providers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_PROVIDER_VALUE}>All providers</SelectItem>
              <SelectItem value="UPLOADTHING">UploadThing</SelectItem>
              <SelectItem value="S3">S3</SelectItem>
              <SelectItem value="CLOUDINARY">Cloudinary</SelectItem>
              <SelectItem value="R2">R2</SelectItem>
              <SelectItem value="LOCAL">Local</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            File asset type
          </label>
          <Select
            value={typeSelectValue}
            onValueChange={(value) =>
              setType(value === ALL_TYPE_VALUE ? "" : value)
            }
          >
            <SelectTrigger className="h-11 w-full rounded-2xl border-slate-200/80 bg-white/80 dark:border-white/10 dark:bg-white/5">
              <SelectValue placeholder="All image-like types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_TYPE_VALUE}>All image-like types</SelectItem>
              <SelectItem value="AVATAR">Avatar</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button
            type="button"
            onClick={handleScan}
            disabled={scanState === "scanning"}
            className="h-11 w-full rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          >
            {scanState === "scanning" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scanning...
              </>
            ) : (
              "Scan orphaned images"
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.45fr_0.95fr]">
        <Card className="rounded-[1.75rem] border-slate-200/80 bg-white/90 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.94),rgba(5,11,31,0.98))]">
          <CardContent className="space-y-5 p-5 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-lg font-semibold text-slate-950 dark:text-white">
                  Orphan image preview
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Only unreferenced image-like assets older than the safety
                  window are included here.
                </p>
              </div>
              <Badge className="w-fit rounded-full border border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-100">
                {formatAnalyticsCount(preview.totalFoundInBatch)} found
              </Badge>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Showing {showingStart}-{showingEnd} of{" "}
                {formatAnalyticsCount(preview.assets.length)} asset
                {preview.assets.length === 1 ? "" : "s"}
              </p>

              <div className="flex items-center gap-3">
                <label className="text-sm text-slate-600 dark:text-slate-400">
                  Per page
                </label>
                <Select
                  value={pageSize}
                  onValueChange={(value) => {
                    setPageSize(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="h-10 w-[110px] rounded-2xl border-slate-200/80 bg-white/80 dark:border-white/10 dark:bg-white/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="6">6</SelectItem>
                    <SelectItem value="8">8</SelectItem>
                    <SelectItem value="12">12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Badge
              className={
                scanState === "scanning"
                  ? "w-fit rounded-full border border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-100"
                  : scanState === "scanned"
                    ? "w-fit rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-100"
                    : scanState === "error"
                      ? "w-fit rounded-full border border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-100"
                      : "w-fit rounded-full border border-slate-200/80 bg-slate-100 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
              }
            >
              {scanState === "scanning"
                ? "Scanning..."
                : scanState === "scanned"
                  ? "Scan complete"
                  : scanState === "error"
                    ? "Scan failed"
                    : "Ready to scan"}
            </Badge>

            {scanMessage ? (
              <p className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-100">
                {scanMessage}
              </p>
            ) : null}

            {scanError ? (
              <p className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-100">
                {scanError}
              </p>
            ) : null}

            {paginatedAssets.length > 0 ? (
              <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/95 shadow-sm dark:border-white/10 dark:bg-slate-950/40">
                <div className="overflow-x-auto">
                  <Table className="min-w-[900px]">
                    <TableHeader>
                      <TableRow className="border-slate-200/70 dark:border-white/10">
                        <TableHead className="w-[92px]">Preview</TableHead>
                        <TableHead>File</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedAssets.map((asset) => (
                        <TableRow
                          key={asset.id}
                          className="border-slate-200/70 dark:border-white/10"
                        >
                          <TableCell className="align-top">
                            {asset.visibility === "PUBLIC" && asset.url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={asset.url}
                                alt={asset.originalName ?? asset.fileName}
                                className="h-14 w-14 rounded-2xl border border-slate-200 object-cover shadow-sm dark:border-white/10"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:border-white/10 dark:bg-white/5">
                                Private
                              </div>
                            )}
                          </TableCell>

                          <TableCell className="max-w-[16rem] align-top">
                            <div className="space-y-1">
                              <p className="truncate text-sm font-medium text-slate-950 dark:text-white">
                                {asset.originalName ?? asset.fileName}
                              </p>
                              <p className="truncate font-mono text-[11px] text-slate-500">
                                {asset.storageKey}
                              </p>
                            </div>
                          </TableCell>

                          <TableCell className="align-top">
                            <Badge className="rounded-full border border-slate-200/80 bg-slate-100 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                              {formatEnumLabel(asset.type)}
                            </Badge>
                          </TableCell>

                          <TableCell className="align-top">
                            <Badge className="rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-100">
                              {asset.storageProvider}
                            </Badge>
                          </TableCell>

                          <TableCell className="align-top text-sm text-slate-600 dark:text-slate-300">
                            {formatBytes(asset.sizeBytes, "—")}
                          </TableCell>

                          <TableCell className="align-top text-sm text-slate-600 dark:text-slate-300">
                            {formatDateLabel(asset.createdAt, "—")}
                          </TableCell>

                              <TableCell className="align-top">
                                <Badge className="rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-100">
                                  {formatEnumLabel(asset.reason)}
                                </Badge>
                              </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="border-t border-slate-200/80 px-4 py-4 dark:border-white/10 sm:px-5">
                  <Pagination className="justify-between">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            setCurrentPage((page) => Math.max(1, page - 1))
                          }
                          disabled={safeCurrentPage <= 1}
                        />
                      </PaginationItem>
                    </PaginationContent>

                    <PaginationContent>
                      {Array.from({ length: totalPages }, (_, index) => index + 1)
                        .slice(
                          Math.max(0, safeCurrentPage - 3),
                          Math.min(totalPages, safeCurrentPage + 2),
                        )
                        .map((pageNumber) => (
                          <PaginationItem key={pageNumber}>
                            <PaginationLink
                              isActive={pageNumber === safeCurrentPage}
                              onClick={() => setCurrentPage(pageNumber)}
                              size="icon-sm"
                            >
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                    </PaginationContent>

                    <PaginationContent>
                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            setCurrentPage((page) =>
                              Math.min(totalPages, page + 1),
                            )
                          }
                          disabled={safeCurrentPage >= totalPages}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            ) : (
              <Card className="rounded-[1.5rem] border-dashed border-slate-200/80 bg-slate-50/80 shadow-none dark:border-white/10 dark:bg-white/5">
                <CardContent className="px-6 py-10 text-center">
                  <p className="text-lg font-semibold text-slate-950 dark:text-white">
                    No orphaned images found
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Widen the preview window or adjust the filters if you want
                    to inspect a different batch.
                  </p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="rounded-[1.75rem] border-slate-200/80 bg-white/90 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.94),rgba(5,11,31,0.98))]">
            <CardContent className="space-y-4 p-5 sm:p-6">
              <p className="text-lg font-semibold text-slate-950 dark:text-white">
                Storage provider breakdown
              </p>
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                A quick split of the current dry-run batch by provider.
              </p>

              {preview.providerBreakdown.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {preview.providerBreakdown.map((item) => (
                    <div
                      key={item.provider}
                      className="min-w-[11rem] rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/5"
                    >
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                        {item.provider}
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                        {item.count}
                      </p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {formatBytes(item.sizeBytes, "0 B")}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                  No providers to display yet.
                </p>
              )}
            </CardContent>
          </Card>

          <OrphanImageCleanupClient
            endpoint={endpoint}
            olderThanDays={preview.olderThanDays}
            limit={preview.limit}
            provider={provider ?? null}
            type={type ?? null}
            previewCount={preview.totalFoundInBatch}
          />
        </div>
      </div>
    </div>
  );
}
