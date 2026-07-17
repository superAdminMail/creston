export const dynamic = "force-dynamic";

import { getUserDashboardDataAction } from "@/actions/dashboard/get-user-dashboard-data";
import { getCurrentUserInvestmentProfileData } from "@/actions/profile/get-current-user-investment-profile";
import UserDashboardPage from "./_components/UserDashboardPage";
import { UserTransactionsClient } from "./_components/UserTransactionsClient";
import { getUserTransactions } from "@/lib/service/getUserTransactions";
import { getCurrentUserId } from "@/lib/getCurrentUser";
import { TradingViewMarketChart } from "@/components/home/TradingViewMarketChart";

export default async function Page() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return (
      <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Please log in to view your dashboard.
          </h2>
        </div>
      </div>
    );
  }

  const { userName, stats } = await getUserDashboardDataAction();
  const investmentProfile = await getCurrentUserInvestmentProfileData();

  const transactions = await getUserTransactions(userId);

  return (
    <div className="space-y-5">
      <UserDashboardPage
        userName={userName}
        stats={stats}
        investmentProfileComplete={investmentProfile.profileComplete}
      />
      <UserTransactionsClient transactions={transactions} />
      <TradingViewMarketChart tone="surface" />
    </div>
  );
}
