"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useTransition } from "react";

import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function AccountSuspendedLogoutButton() {
  const router = useRouter();
  const [isSigningOut, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await signOut().catch(() => {});
      router.replace("/auth/login");
      router.refresh();
    });
  };

  return (
    <Button
      type="button"
      onClick={handleLogout}
      disabled={isSigningOut}
      className="rounded-full bg-[#3c9ee0] px-5 text-white hover:bg-[#2f8bd0] disabled:cursor-not-allowed disabled:opacity-70"
    >
      <LogOut className="mr-2 h-4 w-4" />
      {isSigningOut ? "Signing out..." : "Log out"}
    </Button>
  );
}
