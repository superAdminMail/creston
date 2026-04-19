"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

type DiditCallbackStatus = "Approved" | "Declined" | "In Review";

type DiditCallback = {
  verificationSessionId: string;
  status: DiditCallbackStatus;
};

type DiditCallbackToastProps = {
  callback: DiditCallback | null;
};

export function DiditCallbackToast({ callback }: DiditCallbackToastProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!callback) {
      return;
    }

    const toastId = `didit-callback:${callback.verificationSessionId}`;

    if (callback.status === "Approved") {
      toast.success("Your identity verification was approved.", {
        id: toastId,
      });
    } else if (callback.status === "Declined") {
      toast.error("Your identity verification was declined.", {
        id: toastId,
      });
    } else {
      toast("Your identity verification has been submitted for review.", {
        id: toastId,
      });
    }

    router.replace(pathname);
  }, [callback, pathname, router]);

  return null;
}
