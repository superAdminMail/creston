"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Settings, LayoutDashboard } from "lucide-react";
import { useTransition } from "react";

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { signOut } from "@/lib/auth-client";
import { AccountAvatar } from "./AccountAvatar";

type AccountMenuProps = {
  avatarUrl?: string | null;
  dashboardHref: string;
  email?: string | null;
  name?: string | null;
  variant: "user" | "staff";
};

export function AccountMenu({
  avatarUrl,
  dashboardHref,
  email,
  name,
  variant,
}: AccountMenuProps) {
  const router = useRouter();
  const [isSigningOut, startSigningOut] = useTransition();

  const handleSignOut = () => {
    startSigningOut(async () => {
      await signOut();
      router.push("/auth/login");
      router.refresh();
    });
  };

  return (
    <Menubar
      className={
        variant === "user"
          ? "h-auto rounded-full border border-white/15 bg-white/10 p-1 shadow-[0_16px_40px_rgba(0,0,0,0.18)] backdrop-blur-md"
          : "h-auto rounded-full border border-white/10 bg-white/[0.04] p-1 shadow-[0_14px_32px_rgba(0,0,0,0.2)] backdrop-blur-md"
      }
      aria-label="Account actions"
    >
      <MenubarMenu>
        <MenubarTrigger
          className="group h-auto rounded-full bg-transparent px-1.5 py-1.5 text-slate-100 hover:bg-white/10 focus:bg-white/10 data-[state=open]:bg-white/10"
          aria-label="Open account menu"
        >
          <div className="flex items-center gap-2 pr-1">
            <AccountAvatar
              avatarUrl={avatarUrl}
              className="h-9 w-9"
              email={email}
              name={name}
            />
          </div>
        </MenubarTrigger>

        <MenubarContent
          align="end"
          className="w-72 rounded-2xl border border-white/12 bg-[#071123]/95 p-2 text-slate-100 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl"
        >
          <MenubarLabel className="rounded-xl px-3 py-3 font-normal">
            <div className="flex items-start gap-3">
              <AccountAvatar
                avatarUrl={avatarUrl}
                className="h-10 w-10"
                email={email}
                name={name}
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {name ?? "Havenstone Account"}
                </p>
                <p className="mt-1 truncate text-xs text-slate-400">
                  {email ?? "Secure session"}
                </p>
              </div>
            </div>
          </MenubarLabel>

          <MenubarSeparator className="my-2 bg-white/10" />

          <MenubarItem asChild className="rounded-xl px-3 py-2.5">
            <Link href={dashboardHref}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard Home
            </Link>
          </MenubarItem>

          <MenubarItem asChild className="rounded-xl px-3 py-2.5">
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              Account Settings
            </Link>
          </MenubarItem>

          <MenubarSeparator className="my-2 bg-white/10" />

          <MenubarItem
            disabled={isSigningOut}
            onSelect={handleSignOut}
            variant="destructive"
            className="rounded-xl px-3 py-2.5"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {isSigningOut ? "Signing out..." : "Sign out"}
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
