"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

type SuperAdminRedirectToastProps = {
  message: string;
  kind?: "success" | "error";
};

export function SuperAdminRedirectToast({
  message,
  kind = "success",
}: SuperAdminRedirectToastProps) {
  const router = useRouter();
  const pathname = usePathname();
  const toastId = `${kind}:${pathname}:${message}`;

  useEffect(() => {
    if (!message) {
      return;
    }

    if (kind === "error") {
      toast.error(message, { id: toastId });
    } else {
      toast.success(message, { id: toastId });
    }

    router.replace(pathname);
  }, [kind, message, pathname, router, toastId]);

  return null;
}
