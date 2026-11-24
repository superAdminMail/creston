import TransactionsHistoryClient from "../_components/TransactionsHistoryClient";
import { getCurrentUserId } from "@/lib/getCurrentUser";
import { getUserTransactionsPage } from "@/lib/service/getUserTransactions";
import type {
  TransactionDateRange,
  TransactionSort,
  TransactionType,
} from "@/lib/service/getUserTransactions";

type SearchParams = {
  type?: string;
  status?: string;
  q?: string;
  range?: string;
  start?: string;
  end?: string;
  sort?: string;
  page?: string;
  pageSize?: string;
};

const transactionTypes: Array<TransactionType | "all"> = [
  "all",
  "INVESTMENT",
  "WITHDRAWAL",
  "EARNING",
  "ADJUSTMENT",
  "SAVINGS",
];

const dateRanges: TransactionDateRange[] = [
  "all",
  "today",
  "7d",
  "30d",
  "90d",
  "custom",
];

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return null;
  }

  const params = await searchParams;

  const type = transactionTypes.includes(params.type as TransactionType | "all")
    ? (params.type as TransactionType | "all")
    : "all";

  const dateRange = dateRanges.includes(params.range as TransactionDateRange)
    ? (params.range as TransactionDateRange)
    : "all";

  const sort: TransactionSort = params.sort === "oldest" ? "oldest" : "newest";

  const result = await getUserTransactionsPage(userId, {
    type,
    status: params.status || "all",
    search: params.q || "",
    dateRange,
    startDate: params.start,
    endDate: params.end,
    sort,
    page: Number(params.page) || 1,
    pageSize: Number(params.pageSize) || 10,
  });

  return (
    <TransactionsHistoryClient
      {...result}
      filters={{
        type,
        status: params.status || "all",
        search: params.q || "",
        dateRange,
        startDate: params.start || "",
        endDate: params.end || "",
        sort,
      }}
    />
  );
}
