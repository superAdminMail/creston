"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { AccountShell } from "@/components/account/AccountShell";
import {
  getDashboardNavByRole,
  type DashboardRole,
} from "@/constants/dashboard-menu";

type DashboardLayoutClientProps = {
  children: React.ReactNode;
  userEmail?: string | null;
  userImage?: string | null;
  userName?: string | null;
  userRole: DashboardRole;
};

type DashboardBranch = "user" | "moderator" | "admin" | "super-admin";

const branchConfig: Record<
  DashboardBranch,
  {
    allowedRoles: DashboardRole[];
    basePath: string;
    navRole: DashboardRole;
    roleLabel: string;
    variant: "user" | "staff";
  }
> = {
  user: {
    allowedRoles: ["USER"],
    basePath: "/account/dashboard/user",
    navRole: "USER",
    roleLabel: "Client account",
    variant: "user",
  },
  moderator: {
    allowedRoles: ["MODERATOR", "ADMIN", "SUPER_ADMIN"],
    basePath: "/account/dashboard/moderator",
    navRole: "MODERATOR",
    roleLabel: "Moderator operations",
    variant: "staff",
  },
  admin: {
    allowedRoles: ["ADMIN", "SUPER_ADMIN"],
    basePath: "/account/dashboard/admin",
    navRole: "ADMIN",
    roleLabel: "Administrator console",
    variant: "staff",
  },
  "super-admin": {
    allowedRoles: ["SUPER_ADMIN"],
    basePath: "/account/dashboard/super-admin",
    navRole: "SUPER_ADMIN",
    roleLabel: "Super admin control",
    variant: "staff",
  },
};

function getBranchFromPathname(pathname: string): DashboardBranch {
  if (pathname.startsWith("/account/dashboard/super-admin")) {
    return "super-admin";
  }

  if (pathname.startsWith("/account/dashboard/admin")) {
    return "admin";
  }

  if (pathname.startsWith("/account/dashboard/moderator")) {
    return "moderator";
  }

  return "user";
}

export default function DashboardLayoutClient({
  children,
  userEmail,
  userImage,
  userName,
  userRole,
}: DashboardLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();

  const branch = getBranchFromPathname(pathname);
  const config = branchConfig[branch];
  const isAllowed = config.allowedRoles.includes(userRole);

  useEffect(() => {
    if (!isAllowed) {
      router.replace("/account/dashboard");
    }
  }, [isAllowed, router]);

  if (!isAllowed) {
    return null;
  }

  return (
    <AccountShell
      basePath={config.basePath}
      navSections={getDashboardNavByRole(config.navRole)}
      roleLabel={config.roleLabel}
      userEmail={userEmail}
      userImage={userImage}
      userName={userName}
      variant={config.variant}
    >
      {children}
    </AccountShell>
  );
}
