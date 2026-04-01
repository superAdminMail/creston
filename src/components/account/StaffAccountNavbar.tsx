"use client";

import { AccountNavbarFrame } from "./AccountNavbarFrame";

type StaffAccountNavbarProps = {
  basePath: string;
  menuButton?: React.ReactNode;
  roleLabel: string;
  userEmail?: string | null;
  userImage?: string | null;
  userName?: string | null;
};

export function StaffAccountNavbar({
  basePath,
  menuButton,
  roleLabel,
  userEmail,
  userImage,
  userName,
}: StaffAccountNavbarProps) {
  return (
    <AccountNavbarFrame
      avatarUrl={userImage}
      badgeLabel="Staff"
      breadcrumbRootLabel={roleLabel}
      dashboardHref={basePath}
      email={userEmail}
      menuButton={menuButton}
      name={userName}
      title={roleLabel}
      variant="staff"
    />
  );
}
