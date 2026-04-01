"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import type { DashboardNavSection } from "@/constants/dashboard-menu";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

import { AccountSidebar } from "./AccountSidebar";
import { StaffAccountNavbar } from "./StaffAccountNavbar";
import { UserAccountNavbar } from "./UserAccountNavbar";

type AccountShellProps = {
  basePath: string;
  children: React.ReactNode;
  navSections: DashboardNavSection[];
  userEmail?: string | null;
  userImage?: string | null;
  userName?: string | null;
  variant: "user" | "staff";
  roleLabel: string;
};

export function AccountShell({
  basePath,
  children,
  navSections,
  userEmail,
  userImage,
  userName,
  variant,
  roleLabel,
}: AccountShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const mobileMenuButton = (
    <SheetTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        className={
          variant === "user"
            ? "h-10 w-10 rounded-full border border-white/15 bg-white/10 text-slate-100 hover:bg-white/15"
            : "h-10 w-10 rounded-full border border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
        }
        aria-label="Open dashboard navigation"
      >
        <Menu className="h-5 w-5" />
      </Button>
    </SheetTrigger>
  );

  return (
    <SidebarProvider defaultOpen>
      <div
        className={cn(
          "min-h-screen w-full overflow-x-hidden",
          variant === "user"
            ? "bg-havenstone"
            : "bg-[linear-gradient(180deg,rgba(5,11,31,1),rgba(8,17,37,1))]",
        )}
      >
        <div className="mx-auto flex min-h-screen w-full max-w-[1680px]">
          <div className="hidden shrink-0 lg:block lg:w-[300px] xl:w-[320px]">
            <div className="sticky top-0 h-screen p-4 xl:p-5">
              <Sidebar
                collapsible="none"
                variant={variant === "user" ? "floating" : "inset"}
                className="h-full"
              >
                <AccountSidebar
                  basePath={basePath}
                  navSections={navSections}
                  userEmail={userEmail}
                  userImage={userImage}
                  userName={userName}
                  variant={variant}
                  showAccountIdentity={variant === "user"}
                />
              </Sidebar>
            </div>
          </div>

          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SidebarInset className="min-w-0 flex-1 bg-transparent shadow-none ring-0">
              <div className="flex min-h-screen min-w-0 flex-col px-4 py-4 sm:px-5 lg:px-6 xl:px-8">
                {variant === "user" ? (
                  <UserAccountNavbar
                    menuButton={mobileMenuButton}
                    userEmail={userEmail}
                    userImage={userImage}
                    userName={userName}
                  />
                ) : (
                  <StaffAccountNavbar
                    basePath={basePath}
                    menuButton={mobileMenuButton}
                    roleLabel={roleLabel}
                    userEmail={userEmail}
                    userImage={userImage}
                    userName={userName}
                  />
                )}

                <main className="min-w-0 flex-1 pt-4 lg:pt-6">
                  <div className="mx-auto w-full max-w-[1180px]">
                    {children}
                  </div>
                </main>
              </div>
            </SidebarInset>

            <SheetContent
              side="left"
              className="w-[90vw] max-w-sm border-white/10 bg-[#071123]/96 p-0 text-slate-100"
              showCloseButton
            >
              <SheetHeader className="sr-only">
                <SheetTitle>Dashboard Navigation</SheetTitle>
                <SheetDescription>
                  Navigate through your dashboard sections and settings.
                </SheetDescription>
              </SheetHeader>

              <div className="flex h-full min-h-svh flex-col p-3">
                <AccountSidebar
                  basePath={basePath}
                  navSections={navSections}
                  onNavigate={() => setIsSidebarOpen(false)}
                  showAccountIdentity={variant === "user"}
                  userEmail={userEmail}
                  userImage={userImage}
                  userName={userName}
                  variant={variant}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </SidebarProvider>
  );
}
