export const dynamic = "force-dynamic";

import { getCurrentUserInvestmentProfileData } from "@/actions/profile/get-current-user-investment-profile";
import { UserInvestmentProfileDetailsPage } from "../_components/UserInvestmentProfileDetailsPage";

export default async function UserInvestmentProfilePage() {
  const profile = await getCurrentUserInvestmentProfileData();

  return <UserInvestmentProfileDetailsPage profile={profile} />;
}
