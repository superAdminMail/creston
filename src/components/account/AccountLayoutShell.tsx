"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { signOut } from "@/lib/auth-client";
import { useIsMobile } from "@/hooks/use-mobile";
import { type ProfileDTO } from "@/lib/types";
import {
  Drawer,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
  AccountMobileSideNavShell,
  AccountSidebarShell,
} from "./AccountSidebarShell";
import { DashboardNavbarClient } from "./DashboardNavbar.client";
import { DrawerSurface } from "@/components/ui/drawer-surface";
import { AppNoticeBanner } from "@/components/layout/AppNoticeBanner";

type AccountLayoutShellProps = {
  user: ProfileDTO;
  siteName: string;
  siteLogoUrl?: string | null;
  disclaimerBannerEnabled: boolean;
  disclaimerBannerDismissalKey: string;
  initialDisclaimerBannerDismissed: boolean;
  children: React.ReactNode;
};

export function AccountLayoutShell({
  user,
  siteName,
  siteLogoUrl,
  disclaimerBannerEnabled,
  disclaimerBannerDismissalKey,
  initialDisclaimerBannerDismissed,
  children,
}: AccountLayoutShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSigningOut, startSignOut] = useTransition();
  const isMobile = useIsMobile();
  const router = useRouter();

  const handleLogout = () => {
    startSignOut(async () => {
      await signOut();
      setMobileOpen(false);
      router.push("/auth/login");
      router.refresh();
    });
  };

  return (
    <SidebarProvider className="dashboard-shell min-h-screen bg-card text-slate-950 dark:text-slate-100">
      <div className="w-full">
        <AppNoticeBanner
          key={disclaimerBannerDismissalKey}
          enabled={disclaimerBannerEnabled}
          dismissalKey={disclaimerBannerDismissalKey}
          initialDismissed={initialDisclaimerBannerDismissed}
        />

        <DashboardNavbarClient
          user={user}
          siteName={siteName}
          siteLogoUrl={siteLogoUrl}
          onMenuClick={() => setMobileOpen(true)}
          onLogout={handleLogout}
          isSigningOut={isSigningOut}
        />

        <div className="md:pl-72">
          <aside className="dashboard-sidebar-shell fixed left-0 top-16 z-30 hidden h-[calc(100dvh-4rem)] w-72 md:block">
            <div className="h-full px-4 py-4">
              <AccountSidebarShell
                initialUser={user}
                siteName={siteName}
                onLogout={handleLogout}
                isSigningOut={isSigningOut}
              />
            </div>
          </aside>

          <main className="dashboard-shell-main min-h-[calc(100dvh-4rem)] bg-card px-4 py-4 sm:px-6 sm:py-6">
            {children}
          </main>
        </div>

        <Drawer
          open={isMobile ? mobileOpen : false}
          onOpenChange={setMobileOpen}
          direction="left"
          shouldScaleBackground={false}
        >
          <DrawerSurface
            tone="ghost"
            className="dashboard-mobile-drawer h-dvh max-w-[86vw] rounded-none border-r border-slate-200 bg-transparent p-0 shadow-none dark:border-white/10"
          >
            <DrawerHeader className="sr-only">
              <DrawerTitle>Account navigation</DrawerTitle>
              <DrawerDescription>
                Browse account navigation links and account actions.
              </DrawerDescription>
            </DrawerHeader>

            {mobileOpen ? (
              <div className="h-full overflow-hidden p-0">
                <AccountMobileSideNavShell
                  initialUser={user}
                  siteName={siteName}
                  onNavigate={() => setMobileOpen(false)}
                  onLogout={handleLogout}
                  isSigningOut={isSigningOut}
                />
              </div>
            ) : null}
          </DrawerSurface>
        </Drawer>
      </div>
    </SidebarProvider>
  );
}
