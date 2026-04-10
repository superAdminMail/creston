import TransactionsHistoryClient from "../_components/TransactionsHistoryClient";
import { getCurrentUserId } from "@/lib/getCurrentUser";
import { getUserTransactions } from "@/lib/service/getUserTransactions";

export default async function TransactionsPage() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return null;
  }

  const transactions = await getUserTransactions(userId);

  return <TransactionsHistoryClient transactions={transactions} />;
}
