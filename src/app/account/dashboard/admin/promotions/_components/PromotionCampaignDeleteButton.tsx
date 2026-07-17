"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  deletePromotionCampaignAction,
  type DeletePromotionCampaignActionState,
} from "@/actions/admin/promotions/deletePromotionCampaignAction";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PromotionCampaignDeleteButtonProps = {
  campaignId: string;
  campaignTitle: string;
  redirectTo?: string;
  buttonLabel?: string;
  buttonClassName?: string;
};

const initialState: DeletePromotionCampaignActionState = {
  status: "idle",
};

export function PromotionCampaignDeleteButton({
  campaignId,
  campaignTitle,
  redirectTo = "/account/dashboard/admin/promotions",
  buttonLabel = "Delete promotion",
  buttonClassName,
}: PromotionCampaignDeleteButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    deletePromotionCampaignAction,
    initialState,
  );
  const lastToastKey = useRef<string | null>(null);
  const dialogOpen = open && state.status !== "success";

  useEffect(() => {
    if (state.status === "idle" || !state.message) {
      return;
    }

    const toastKey = `${state.status}:${state.message}:${state.campaignId ?? ""}`;

    if (lastToastKey.current === toastKey) {
      return;
    }

    lastToastKey.current = toastKey;

    if (state.status === "success") {
      toast.success(state.message);
      router.replace(redirectTo);
      router.refresh();
      return;
    }

    toast.error(state.message);
  }, [redirectTo, router, state.campaignId, state.message, state.status]);

  return (
    <Dialog open={dialogOpen} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="outline"
        className={
          buttonClassName ??
          "rounded-2xl border-rose-200/80 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200 dark:hover:bg-rose-500/20 dark:hover:text-white"
        }
        onClick={() => setOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
        {buttonLabel}
      </Button>

      <DialogContent
        showCloseButton={false}
        className="w-full max-w-[calc(100%-2rem)] border-border/60 bg-white/95 !bg-none text-slate-950 shadow-[0_24px_70px_rgba(15,23,42,0.18)] sm:max-w-lg dark:border-white/10 dark:bg-slate-950/95 dark:!bg-gradient-to-b dark:from-[#0b1526] dark:via-[#09111f] dark:to-[#050b17] dark:text-white dark:shadow-[0_24px_70px_rgba(0,0,0,0.45)]"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-left">
            <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-300" />
            Delete promotion
          </DialogTitle>
          <DialogDescription className="text-left text-slate-600 dark:text-slate-300">
            This will permanently delete{" "}
            <span className="font-medium text-slate-900 dark:text-white">
              {campaignTitle}
            </span>{" "}
            and its delivery records. Any delivered promotion notifications tied
            to this campaign will also be cleared.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="campaignId" value={campaignId} />

          <div className="rounded-2xl border border-rose-200/70 bg-rose-50/80 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
            This action cannot be undone.
          </div>

          <DialogFooter className="border-slate-200/80 bg-slate-50/90 dark:border-white/10 dark:bg-white/[0.03]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-2xl border-border/60 bg-white/95 text-slate-950 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={pending}
              className="rounded-2xl bg-rose-600 text-white hover:bg-rose-500"
            >
              {pending ? "Deleting..." : "Delete promotion"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
