"use client";

import { X } from "lucide-react";
import { useState } from "react";

import { getAppNoticeBannerCookieName } from "./appNoticeBannerCookie";

type AppNoticeBannerProps = {
  enabled: boolean;
  dismissalKey: string;
  initialDismissed?: boolean;
};

export function AppNoticeBanner({
  enabled,
  dismissalKey,
  initialDismissed = false,
}: AppNoticeBannerProps) {
  const [dismissed, setDismissed] = useState(initialDismissed);
  const cookieName = getAppNoticeBannerCookieName(dismissalKey);

  if (!enabled || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);

    if (typeof document !== "undefined") {
      document.cookie = `${cookieName}=1; Path=/; Max-Age=${
        60 * 60 * 24 * 30
      }; SameSite=Lax`;
    }
  };

  return (
    <div className="border-b border-sky-200/80 bg-sky-50 text-sky-950 dark:border-sky-400/20 dark:bg-sky-500/10 dark:text-sky-50">
      <div className="mx-auto flex max-w-7xl items-start gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-6">
            <span className="font-semibold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-200">
              IMPORTANT:
            </span>{" "}
            this is a{" "}
            <span className="font-semibold uppercase tracking-[0.14em]">
              TEST
            </span>{" "}
            system, not to be used for real application or project management
            purposes.
          </p>
        </div>

        <button
        type="button"
        onClick={handleDismiss}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-sky-200 bg-white text-sky-700 shadow-sm transition hover:bg-sky-100 hover:text-sky-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 dark:border-sky-400/20 dark:bg-sky-500/10 dark:text-sky-100 dark:hover:bg-sky-500/20"
        aria-label="Dismiss test system notice"
      >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
