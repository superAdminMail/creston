"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { cancelSavingsAccount } from "@/actions/savings/cancelSavingsAccount";
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

type CancelSavingsAccountButtonProps = {
  accountId: string;
  className?: string;
};

export default function CancelSavingsAccountButton({
  accountId,
  className,
}: CancelSavingsAccountButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleCancel() {
    startTransition(async () => {
      const result = await cancelSavingsAccount(accountId);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setOpen(false);
      router.refresh();
    });
  }

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
          Cancel account
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Close savings account?</AlertDialogTitle>
          <AlertDialogDescription className="leading-6">
            This will close the savings account and stop it from being used for
            new deposits. Make sure the balance is already withdrawn.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Keep account</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault();
              handleCancel();
            }}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Closing...
              </>
            ) : (
              "Yes, close"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
