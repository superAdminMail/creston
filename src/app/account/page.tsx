import { redirect } from "next/navigation";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";

export default async function AccountIndexPage() {
  const sessionUser = await getCurrentSessionUser();

  if (!sessionUser?.id) {
    redirect("/auth/login");
  }

  redirect("/account/continue");
}
