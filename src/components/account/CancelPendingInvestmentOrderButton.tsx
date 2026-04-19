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
            "rounded-2xl border border-rose-400/20 bg-rose-400/8 text-rose-200 transition hover:border-rose-400/30 hover:bg-rose-400/12 hover:text-rose-100 dark:border-rose-400/20 dark:bg-rose-400/10 dark:hover:bg-rose-400/15",
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
