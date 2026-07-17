"use client";

import { useMemo, useState } from "react";

import type { TransactionItem } from "@/lib/service/getUserTransactions";
import { useResponsivePageSize } from "@/hooks/use-responsive-page-size";

import { AdminPaginationFooter } from "../../admin/_components/AdminPaginationFooter";
import { TransactionTable } from "./TransactionTable";

const MOBILE_PAGE_SIZE = 10;
const DESKTOP_PAGE_SIZE = 26;

type UserTransactionsClientProps = {
  transactions: TransactionItem[];
};

export function UserTransactionsClient({
  transactions,
}: UserTransactionsClientProps) {
  const pageSize = useResponsivePageSize({
    mobilePageSize: MOBILE_PAGE_SIZE,
    desktopPageSize: DESKTOP_PAGE_SIZE,
  });
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(transactions.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const visibleTransactions = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return transactions.slice(startIndex, startIndex + pageSize);
  }, [pageSize, safeCurrentPage, transactions]);

  return (
    <div className="space-y-4">
      <TransactionTable transactions={visibleTransactions} />

      <AdminPaginationFooter
        currentPage={safeCurrentPage}
        totalItems={transactions.length}
        pageSize={pageSize}
        itemLabel="transactions"
        onPrev={() => setCurrentPage((page) => Math.max(1, page - 1))}
        onNext={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
      />
    </div>
  );
}
