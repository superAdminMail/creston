import { getCurrentUserInvestmentProfileData } from "@/actions/profile/get-current-user-investment-profile";
import { UserInvestmentProfileDetailsPage } from "./UserInvestmentProfileDetailsPage";

export default async function UserInvestmentProfilePage() {
  const profile = await getCurrentUserInvestmentProfileData();

  return <UserInvestmentProfileDetailsPage profile={profile} />;
}
