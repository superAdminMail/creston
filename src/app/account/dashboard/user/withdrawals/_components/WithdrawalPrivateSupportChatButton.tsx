"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageSquareText } from "lucide-react";
import { toast } from "sonner";

import { createWithdrawalPrivateSupportConversationAction } from "@/actions/support/createWithdrawalPrivateSupportConversationAction";
import { Button } from "@/components/ui/button";

type Props = {
  withdrawalId: string;
};

export function WithdrawalPrivateSupportChatButton({ withdrawalId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleOpenChat = () => {
    startTransition(async () => {
      const result = await createWithdrawalPrivateSupportConversationAction({
        withdrawalId,
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success("Private support chat opened");
      router.push(`/account/dashboard/user/support/${result.conversationId}`);
      router.refresh();
    });
  };

  return (
    <Button
      type="button"
      onClick={handleOpenChat}
      disabled={isPending}
      className="w-full rounded-full bg-[#3c9ee0] text-white hover:bg-[#2f8bd0] sm:w-auto"
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Opening chat...
        </>
      ) : (
        <>
          <MessageSquareText className=" h-4 w-4" />
          Have a question?
        </>
      )}
    </Button>
  );
}
