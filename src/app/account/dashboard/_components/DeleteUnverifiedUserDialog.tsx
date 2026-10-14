"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteUnverifiedUserAction } from "@/actions/super-admin/users/deleteUnverifiedUserAction";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DeleteUnverifiedUserDialogProps = {
  user: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  onOpenChange: (open: boolean) => void;
  onDeleted?: (userId: string) => void;
};

export function DeleteUnverifiedUserDialog({
  user,
  onOpenChange,
  onDeleted,
}: DeleteUnverifiedUserDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleOpenChange(open: boolean) {
    if (!open && isPending) return;

    if (open) setError(null);
    onOpenChange(open);
  }

  function handleDelete() {
    if (!user || isPending) return;

    setError(null);

    startTransition(async () => {
      const result = await deleteUnverifiedUserAction(user.id);

      if ("error" in result) {
        setError(result.error);
        toast.error(result.error);
        return;
      }

      toast.success("Unverified user permanently deleted.");
      onDeleted?.(result.deletedUserId);
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={Boolean(user)} onOpenChange={handleOpenChange}>
      <DialogContent className="!rounded-[1.75rem] !border-slate-200/80 !bg-none !bg-white/95 !p-0 !text-slate-950 !shadow-[0_24px_70px_rgba(15,23,42,0.18)] dark:!border-white/10 dark:!bg-zinc-950/95 dark:!text-white dark:!shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
        {user ? (
          <div className="space-y-5 p-5 sm:p-6">
            <DialogHeader className="space-y-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300">
                <AlertTriangle className="h-5 w-5" />
              </div>

              <DialogTitle className="text-2xl font-semibold tracking-tight">
                Permanently delete user?
              </DialogTitle>

              <DialogDescription className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                This permanently removes the unverified account. This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 rounded-[1.35rem] border border-slate-200/80 bg-slate-50 p-4 text-sm dark:border-white/10 dark:bg-white/[0.04]">
              <div>
                <p className="text-xs text-slate-500">Name</p>
                <p className="mt-1 break-words font-medium">{user.fullName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="mt-1 break-all font-medium">{user.email}</p>
              </div>
            </div>

            {error ? (
              <div
                role="alert"
                className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300"
              >
                {error}
              </div>
            ) : null}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200/80 pt-4 sm:flex-row sm:justify-end dark:border-white/10">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
                className="rounded-full text-white hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-500 dark:hover:text-slate-50"
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="rounded-full bg-rose-600 text-white hover:bg-rose-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isPending ? "Deleting account..." : "Permanently delete"}
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
