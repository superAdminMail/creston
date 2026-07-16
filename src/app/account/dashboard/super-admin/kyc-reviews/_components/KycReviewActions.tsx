"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { verifySuperAdminKycReview } from "@/actions/super-admin/kyc-reviews/verifySuperAdminKycReview";
import type {
  SuperAdminKycReviewListItem,
} from "@/actions/super-admin/kyc-reviews/getSuperAdminKycReviews";
import type {
  VerifySuperAdminKycReviewState,
} from "@/actions/super-admin/kyc-reviews/verifySuperAdminKycReview";
import { createInitialFormState } from "@/lib/forms/actionState";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SuperAdminActionSubmitButton } from "../../_components/SuperAdminActionSubmitButton";

const initialState =
  createInitialFormState<
    "investorProfileId" | "verificationSessionId" | "reviewKind"
  >() as VerifySuperAdminKycReviewState;

type KycReviewActionsProps = {
  review: SuperAdminKycReviewListItem;
};

export function KycReviewActions({ review }: KycReviewActionsProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(
    verifySuperAdminKycReview,
    initialState,
  );
  const lastToastKey = useRef<string | null>(null);

  useEffect(() => {
    if (state.status === "idle" || !state.message) {
      return;
    }

    const toastKey = `${state.status}:${state.message}`;
    if (lastToastKey.current === toastKey) {
      return;
    }

    lastToastKey.current = toastKey;

    if (state.status === "success") {
      toast.success(state.message);
      router.refresh();
      return;
    }

    toast.error(state.message);
  }, [router, state.message, state.status]);

  const profileHref = `/account/dashboard/super-admin/investors/${review.investorProfileId}`;

  return (
    <div className="flex w-full max-w-full flex-col gap-2 xl:w-[14rem]">
      <Button
        asChild
        variant="outline"
        className={cn(
          "h-11 w-full justify-center gap-2 rounded-2xl border-slate-200 bg-white/75 text-slate-700 shadow-sm hover:border-sky-200 hover:bg-sky-50 hover:text-sky-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-sky-400/10 dark:hover:text-white",
        )}
      >
        <Link href={profileHref}>
          <ExternalLink className="h-4 w-4" />
          View profile
        </Link>
      </Button>

      <form action={formAction} className="space-y-2">
        <input
          type="hidden"
          name="investorProfileId"
          value={review.investorProfileId}
        />
        <input
          type="hidden"
          name="verificationSessionId"
          value={review.latestSession?.id ?? ""}
        />
        <input type="hidden" name="reviewKind" value={review.reviewState} />

        <SuperAdminActionSubmitButton
          idleLabel={review.actionLabel}
          pendingLabel="Verifying..."
          variant="default"
          className="h-11 w-full justify-center rounded-2xl px-4"
        />
      </form>

      {state.status === "error" && state.message ? (
        <p className="text-xs leading-5 text-rose-600 dark:text-rose-300">
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
