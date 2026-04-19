"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { skipOnboardingAction } from "@/actions/onboarding/skip-onboarding";
import { InvestmentProfileForm } from "./investment-profile-form";

type OnboardingDialogProps = {
  userName: string;
  siteName: string;
};

export function OnboardingDialog({
  userName,
  siteName,
}: OnboardingDialogProps) {
  const router = useRouter();

  const handleSkip = async () => {
    await skipOnboardingAction();
    router.push("/account/dashboard");
    router.refresh();
  };

  return (
    <div className="flex items-center justify-center ">
      <Dialog open>
        <DialogContent
          className="top-[calc(50%+4rem)] max-h-[calc(100dvh-9.5rem)] overflow-y-auto border-white/10 bg-[var(--card)] text-[var(--foreground)] sm:top-[calc(50%+4.75rem)] sm:max-h-[calc(100dvh-11rem)] sm:max-w-2xl"
          showCloseButton={false}
        >
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl font-semibold tracking-[-0.03em]">
              Set up your investment profile
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-slate-400">
              Welcome to {siteName}, {userName}. Please set up your investment
              profile to get started, including the structured address fields
              that Mapbox can now prefill for you.
            </DialogDescription>
          </DialogHeader>

          <InvestmentProfileForm onCreateLater={handleSkip} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
