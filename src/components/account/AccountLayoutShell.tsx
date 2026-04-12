"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { signOut } from "@/lib/auth-client";
import { useIsMobile } from "@/hooks/use-mobile";
import { type ProfileDTO } from "@/lib/types";
import {
  Drawer,
  DrawerContent,
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

type AccountLayoutShellProps = {
  user: ProfileDTO;
  siteName: string;
  siteLogoUrl?: string | null;
  children: React.ReactNode;
};

export function AccountLayoutShell({
  user,
  siteName,
  siteLogoUrl,
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
    <SidebarProvider className="min-h-screen bg-transparent text-slate-950 transition-colors dark:text-slate-100">
      <div className="w-full">
        <DashboardNavbarClient
          user={user}
          siteName={siteName}
          siteLogoUrl={siteLogoUrl}
          onMenuClick={() => setMobileOpen(true)}
          onLogout={handleLogout}
          isSigningOut={isSigningOut}
        />

        <div className="md:pl-72">
          <motion.aside
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="fixed left-0 top-16 z-30 hidden h-[calc(100dvh-4rem)] w-72 md:block"
          >
            <div className="h-full px-4 py-4">
              <AccountSidebarShell
                initialUser={user}
                onLogout={handleLogout}
                isSigningOut={isSigningOut}
              />
            </div>
          </motion.aside>

          <motion.main
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: "easeOut", delay: 0.04 }}
            className="h-[calc(100dvh-4rem)] overflow-y-auto px-4 py-4 sm:px-6 sm:py-6"
          >
            {children}
          </motion.main>
        </div>

        <Drawer
          open={isMobile ? mobileOpen : false}
          onOpenChange={setMobileOpen}
          direction="left"
          shouldScaleBackground={false}
        >
          <DrawerContent className="h-dvh max-w-[86vw] rounded-none border-r border-slate-200 bg-transparent p-0 shadow-none dark:border-white/10">
            <DrawerHeader className="sr-only">
              <DrawerTitle>Account navigation</DrawerTitle>
              <DrawerDescription>
                Browse account navigation links and account actions.
              </DrawerDescription>
            </DrawerHeader>

            <AnimatePresence initial={false}>
              {mobileOpen ? (
                <motion.div
                  key="mobile-account-nav"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="h-full overflow-hidden p-0"
                >
                  <AccountMobileSideNavShell
                    initialUser={user}
                    onNavigate={() => setMobileOpen(false)}
                    onLogout={handleLogout}
                    isSigningOut={isSigningOut}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </DrawerContent>
        </Drawer>
      </div>
    </SidebarProvider>
  );
}
