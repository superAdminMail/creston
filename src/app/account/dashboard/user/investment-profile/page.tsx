export const dynamic = "force-dynamic";

import { getCurrentUserInvestmentProfileData } from "@/actions/profile/get-current-user-investment-profile";
import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";
import { UserInvestmentProfileDetailsPage } from "../_components/UserInvestmentProfileDetailsPage";

export default async function UserInvestmentProfilePage() {
  const profile = await getCurrentUserInvestmentProfileData();
  const site = await getSiteConfigurationCached();
  const siteName = site?.siteName?.trim() || "Company";

  return (
    <UserInvestmentProfileDetailsPage
      profile={profile}
      siteName={siteName}
    />
  );
}
