"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Headset, LoaderCircle } from "lucide-react";

import { getSupportTicketRoute } from "@/lib/support/get-support-ticket-route";

type SupportRole = "USER" | "ADMIN" | "MODERATOR" | "SUPER_ADMIN";

type FloatingSupportButtonProps = {
  role: SupportRole | null;
};

export function FloatingSupportButton({ role }: FloatingSupportButtonProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isNavigating, setIsNavigating] = useState(false);
  const targetRouteRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isNavigating || !targetRouteRef.current) return;

    const targetRoute = targetRouteRef.current;
    const hasReachedTarget =
      pathname === targetRoute || pathname.startsWith(`${targetRoute}/`);

    if (hasReachedTarget) {
      targetRouteRef.current = null;
      setIsNavigating(false);
    }
  }, [pathname, isNavigating]);

  const handleClick = () => {
    if (isNavigating) return;

    const route = role ? getSupportTicketRoute(role) : "/contact";

    if (pathname === route || pathname.startsWith(`${route}/`)) {
      return;
    }

    targetRouteRef.current = route;
    setIsNavigating(true);
    router.push(route);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isNavigating}
      aria-label={isNavigating ? "Opening support" : "Contact support"}
      aria-busy={isNavigating}
      title={isNavigating ? "Opening support..." : "Contact support"}
      className="
        group fixed bottom-5 right-5 z-50
        flex size-14 items-center justify-center
        rounded-full bg-blue-600 text-white
        shadow-lg shadow-blue-950/30
        transition-all duration-300
        hover:scale-105 hover:bg-blue-500
        hover:shadow-xl
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-blue-400
        focus-visible:ring-offset-2
        active:scale-95
        disabled:cursor-wait disabled:opacity-90
      "
    >
      {isNavigating ? (
        <LoaderCircle
          size={25}
          strokeWidth={1.9}
          className="animate-spin"
          aria-hidden="true"
        />
      ) : (
        <Headset size={25} strokeWidth={1.9} aria-hidden="true" />
      )}
    </button>
  );
}
