"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, Share } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

type Browser = "chromium" | "safari" | "unsupported";

type InstallAppButtonProps = {
  siteName?: string;
};

export function InstallAppButton({ siteName = "App" }: InstallAppButtonProps) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [installed, setInstalled] = useState(false);
  const [browser, setBrowser] = useState<Browser>("unsupported");
  const [showSafariDialog, setShowSafariDialog] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS standalone
      ("standalone" in navigator &&
        (navigator as Navigator & { standalone?: boolean }).standalone);

    if (standalone) {
      setInstalled(true);
      return;
    }

    const ua = navigator.userAgent;

    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isSafari = /^((?!chrome|android|crios|fxios|edgios).)*safari/i.test(
      ua,
    );

    if (isSafari && isIOS) {
      setBrowser("safari");
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setBrowser("chromium");
    };

    const handleInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );

      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;

    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const shouldRender = useMemo(() => {
    if (installed) return false;

    return browser === "chromium" || browser === "safari";
  }, [browser, installed]);

  if (!shouldRender) return null;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="gap-2 border border-white/8 bg-white/[0.03] hover:bg-white/[0.04] dark:bg-white/[0.05] dark:hover:bg-white/[0.06]"
        onClick={
          browser === "chromium"
            ? handleInstall
            : () => setShowSafariDialog(true)
        }
      >
        <Download className="h-4 w-4" />
        Install {siteName}
      </Button>

      <Dialog open={showSafariDialog} onOpenChange={setShowSafariDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Install {siteName}</DialogTitle>
            <DialogDescription>
              Install {siteName} for a faster, app-like experience on your
              iPhone or iPad.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <Share className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Tap the <strong>Share</strong> button in Safari.
              </span>
            </div>

            <div className="pl-7">
              Select <strong>Add to Home Screen</strong>.
            </div>

            <div className="pl-7">
              Tap <strong>Add</strong> to finish installing {siteName}.
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowSafariDialog(false)}
              className="w-full"
            >
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default InstallAppButton;
