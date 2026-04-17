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

  return <PromotionCampaignDetail campaign={campaign} />;
}
