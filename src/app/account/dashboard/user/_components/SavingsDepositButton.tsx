"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  accountId: string;
  label?: string;
  disabled?: boolean;
  disabledLabel?: string;
  className?: string;
};

export default function SavingsDepositButton({
  accountId,
  label = "Deposit",
  disabled = false,
  disabledLabel = "Target reached",
  className,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      disabled={disabled || isPending}
      onClick={() =>
        startTransition(() => {
          router.push(
            `/account/dashboard/checkout?targetType=SAVINGS_FUNDING&targetId=${accountId}`,
          );
        })
      }
      className={className}
    >
      {isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : disabled ? (
        disabledLabel
      ) : (
        label
      )}
    </Button>
  );
}
