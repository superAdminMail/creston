"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { cancelUserInvestmentOrder } from "@/actions/investment-order/cancelInvestmentOrder";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CancelPendingInvestmentOrderButtonProps = {
  orderId: string;
  className?: string;
};

export function CancelPendingInvestmentOrderButton({
  orderId,
  className,
}: CancelPendingInvestmentOrderButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleCancel = () => {
    startTransition(async () => {
      const result = await cancelUserInvestmentOrder(orderId);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "rounded-2xl border border-rose-300 bg-rose-100 px-4 font-semibold text-rose-900 shadow-sm transition hover:border-rose-400 hover:bg-rose-200 hover:text-rose-950 dark:border-rose-400/40 dark:bg-rose-500/20 dark:text-rose-50 dark:hover:bg-rose-500/30 dark:hover:text-white",
            className,
          )}
        >
          Cancel order
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel investment order?</AlertDialogTitle>
          <AlertDialogDescription className="leading-6">
            Are you sure you want to cancel this order?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Keep order</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault();
              handleCancel();
            }}
          >
            {isPending ? "Cancelling..." : "Yes, Cancel"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
