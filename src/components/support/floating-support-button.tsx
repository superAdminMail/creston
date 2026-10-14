"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Headset, LoaderCircle } from "lucide-react";

import { getSupportTicketRoute } from "@/lib/support/get-support-ticket-route";

type SupportRole = "USER" | "ADMIN" | "MODERATOR" | "SUPER_ADMIN";

type FloatingSupportButtonProps = {
  role: SupportRole | null;
};

export function FloatingSupportButton({ role }: FloatingSupportButtonProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleClick = () => {
    if (isNavigating) return;

    setIsNavigating(true);

    const route = role ? getSupportTicketRoute(role) : "/contact";

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
