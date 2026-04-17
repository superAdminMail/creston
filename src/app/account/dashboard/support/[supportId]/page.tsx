import { redirect } from "next/navigation";

export default async function SupportLegacyRedirectPage({
  params,
}: {
  params: Promise<{ supportId: string }>;
}) {
  const { supportId } = await params;
  redirect(`/account/dashboard/user/support/${supportId}`);
}
