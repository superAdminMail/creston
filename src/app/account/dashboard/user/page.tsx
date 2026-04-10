import { getUserDashboardDataAction } from "@/actions/dashboard/get-user-dashboard-data";
import UserDashboardPage from "./_components/UserDashboardPage";
import { TransactionTable } from "./_components/TransactionTable";
import { getUserTransactions } from "@/lib/service/getUserTransactions";
import { getCurrentUserId } from "@/lib/getCurrentUser";

export default async function Page() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return (
      <div className="mx-auto h-[calc(100dvh-4rem)] min-h-0 max-w-5xl overflow-hidden bg-white px-4 py-4 dark:bg-neutral-950 sm:px-6 lg:px-8">
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Please log in to view your dashboard.
          </h2>
        </div>
      </div>
    );
  }

  const { userName, stats } = await getUserDashboardDataAction();

  const transactions = await getUserTransactions(userId);

  return (
    <main className="space-y-5">
      <UserDashboardPage userName={userName} stats={stats} />
      <TransactionTable transactions={transactions} />
    </main>
  );
}
