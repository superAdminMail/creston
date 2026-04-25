"use client";

import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { SuperAdminSectionCard } from "../../_components/SuperAdminSectionCard";

type CleanupExecuteResult = {
  scanned: number;
  deletedFromStorage: number;
  deletedFromDatabase: number;
  skipped: number;
  failed: number;
  results: Array<{
    assetId: string;
    originalName: string | null;
    fileName: string;
    storageProvider: string;
    storageKey: string;
    status: "deleted" | "skipped" | "failed";
    reason: string;
    deletedFromStorage: boolean;
    deletedFromDatabase: boolean;
    storageResult: {
      ok: boolean;
      provider: string;
      storageKey: string;
      error?: string;
    } | null;
  }>;
};

type OrphanImageCleanupClientProps = {
  endpoint: string;
  olderThanDays: number;
  limit: number;
  provider: string | null;
  type: string | null;
  previewCount: number;
};

export function OrphanImageCleanupClient({
  endpoint,
  olderThanDays,
  limit,
  provider,
  type,
  previewCount,
}: OrphanImageCleanupClientProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleteStorage, setDeleteStorage] = useState(true);
  const [forceDbDelete, setForceDbDelete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CleanupExecuteResult | null>(null);

  const canSubmit = useMemo(
    () => confirmText.trim() === "DELETE_ORPHANED_IMAGES" && !isSubmitting,
    [confirmText, isSubmitting],
  );

  async function handleDelete() {
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          confirm: "DELETE_ORPHANED_IMAGES",
          olderThanDays,
          limit,
          provider,
          type,
          deleteStorage,
          forceDbDelete,
        }),
      });

      const payload = (await response.json()) as
        | CleanupExecuteResult
        | { error?: string };

      if (!response.ok) {
        setError("error" in payload ? payload.error ?? "Unable to clean up." : "Unable to clean up.");
        return;
      }

      setResult(payload as CleanupExecuteResult);
      setOpen(false);
    } catch {
      setError("Unable to clean up orphan images right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function refreshPreview() {
    router.refresh();
  }

  const highlightedResults =
    result?.results.filter((item) => item.status !== "deleted") ?? [];

  return (
    <div className="space-y-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="destructive"
            className="h-11 rounded-2xl px-5 text-sm font-semibold shadow-lg shadow-rose-950/20"
          >
            Delete previewed orphans
          </Button>
        </DialogTrigger>

        <DialogContent className="rounded-[1.75rem] border-white/10 bg-slate-950 text-white sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Confirm orphan image cleanup
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-slate-400">
              This removes unreferenced image records and matching storage
              files. It will not touch KYC, receipts, reports, or referenced
              media.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm leading-6 text-rose-100">
              <p className="font-semibold">Danger zone</p>
              <p className="mt-1 text-rose-100/80">
                The current preview contains {previewCount} candidate image
                asset{previewCount === 1 ? "" : "s"}.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-orphan-cleanup">Confirmation text</Label>
              <Input
                id="confirm-orphan-cleanup"
                value={confirmText}
                onChange={(event) => setConfirmText(event.target.value)}
                placeholder="DELETE_ORPHANED_IMAGES"
                autoComplete="off"
                className="h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-slate-500"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-white">
                      Delete storage files
                    </p>
                    <p className="text-xs leading-5 text-slate-400">
                      Remove matching UploadThing files first.
                    </p>
                  </div>
                  <Switch checked={deleteStorage} onCheckedChange={setDeleteStorage} />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-white">
                      Force DB delete
                    </p>
                    <p className="text-xs leading-5 text-slate-400">
                      Remove the registry row even if storage deletion fails.
                    </p>
                  </div>
                  <Switch checked={forceDbDelete} onCheckedChange={setForceDbDelete} />
                </div>
              </div>
            </div>

            {error ? (
              <p className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </p>
            ) : null}
          </div>

          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              className="rounded-2xl"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="destructive"
              className="rounded-2xl px-5 font-semibold"
              onClick={handleDelete}
              disabled={!canSubmit}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete orphaned images"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {result ? (
        <SuperAdminSectionCard
          title="Deletion summary"
          description="Latest execution result for the orphan image cleanup batch."
          className="border-rose-500/20"
          headerClassName="bg-gradient-to-r from-rose-500/10 via-transparent to-transparent"
          contentClassName="space-y-5"
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryPill label="Scanned" value={result.scanned} tone="slate" />
            <SummaryPill
              label="Deleted from storage"
              value={result.deletedFromStorage}
              tone="emerald"
            />
            <SummaryPill
              label="Deleted from database"
              value={result.deletedFromDatabase}
              tone="blue"
            />
            <SummaryPill
              label="Failed / skipped"
              value={result.failed + result.skipped}
              tone="rose"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              className="rounded-2xl"
              onClick={refreshPreview}
            >
              Re-run dry preview
            </Button>
            <p className="text-sm text-slate-500">
              Refreshing the preview will re-check orphan status before showing
              the batch again.
            </p>
          </div>

          {highlightedResults.length > 0 ? (
            <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white">
                Skipped and failed items
              </p>
              <div className="max-h-72 space-y-2 overflow-auto pr-1">
                {highlightedResults.map((item) => (
                  <div
                    key={item.assetId}
                    className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {item.originalName ?? item.fileName}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.storageProvider} • {item.reason}
                      </p>
                    </div>
                    <Badge
                      className={
                        item.status === "failed"
                          ? "rounded-full border border-rose-500/20 bg-rose-500/10 text-rose-100"
                          : "rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-100"
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </SuperAdminSectionCard>
      ) : null}
    </div>
  );
}

function SummaryPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "slate" | "emerald" | "blue" | "rose";
}) {
  const toneClassName =
    tone === "emerald"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-100"
      : tone === "blue"
        ? "border-sky-500/20 bg-sky-500/10 text-sky-100"
        : tone === "rose"
          ? "border-rose-500/20 bg-rose-500/10 text-rose-100"
          : "border-white/10 bg-white/5 text-slate-100";

  return (
    <div className={`rounded-2xl border px-4 py-3 ${toneClassName}`}>
      <p className="text-xs uppercase tracking-[0.24em] text-current/70">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
