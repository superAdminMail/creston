"use client";

import { AccountNavbarFrame } from "./AccountNavbarFrame";

type UserAccountNavbarProps = {
  menuButton?: React.ReactNode;
  userEmail?: string | null;
  userName?: string | null;
  userImage?: string | null;
};

export function UserAccountNavbar({
  menuButton,
  userEmail,
  userImage,
  userName,
}: UserAccountNavbarProps) {
  return (
    <AccountNavbarFrame
      avatarUrl={userImage}
      badgeLabel="Client"
      breadcrumbRootLabel="Dashboard"
      dashboardHref="/account/dashboard/user"
      email={userEmail}
      menuButton={menuButton}
      name={userName}
      title="Dashboard"
      variant="user"
    />
  );
}
