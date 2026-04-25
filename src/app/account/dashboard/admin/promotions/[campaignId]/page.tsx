import { headers } from "next/headers";

import PromotionCampaignDetail from "../_components/PromotionCampaignDetail";
import { getPromotionCampaignDetails } from "../_lib/getPromotionCampaignDetails";

type PageProps = {
  params: Promise<{
    campaignId: string;
  }>;
};

export default async function PromotionCampaignDetailPage({
  params,
}: PageProps) {
  const { campaignId } = await params;
  const campaign = await getPromotionCampaignDetails(campaignId);
  const requestHeaders = await headers();
  const forwardedHost =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const forwardedProto = requestHeaders.get("x-forwarded-proto") ?? "https";
  const siteOrigin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : "";

  return <PromotionCampaignDetail campaign={campaign} siteOrigin={siteOrigin} />;
}
