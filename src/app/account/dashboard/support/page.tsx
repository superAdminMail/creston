import { redirect } from "next/navigation";

export default async function SupportRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ conversation?: string }>;
}) {
  const { conversation } = await searchParams;

  if (conversation) {
    redirect(`/account/dashboard/user/support/${conversation}`);
  }

  redirect("/account/dashboard/user/support");
}
