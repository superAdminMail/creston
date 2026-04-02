import { redirect } from "next/navigation";

import { AccountLayoutShell } from "@/components/account/AccountLayoutShell";
import { getCurrentUser } from "@/lib/getCurrentUser";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return <AccountLayoutShell user={user}>{children}</AccountLayoutShell>;
}
