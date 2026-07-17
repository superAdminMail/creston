"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type AdminPaginationFooterProps = {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  itemLabel: string;
  onPrev: () => void;
  onNext: () => void;
};

export function AdminPaginationFooter({
  currentPage,
  totalItems,
  pageSize,
  itemLabel,
  onPrev,
  onNext,
}: AdminPaginationFooterProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const visibleStart = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const visibleEnd = Math.min(safeCurrentPage * pageSize, totalItems);

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="rounded-[1.5rem] border border-border/70 bg-white/80 px-4 py-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Showing {visibleStart}-{visibleEnd} of {totalItems} {itemLabel}
        </p>

        <Pagination className="mx-0 w-full justify-between sm:w-auto sm:justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                text="Prev"
                onClick={onPrev}
                disabled={safeCurrentPage <= 1}
              />
            </PaginationItem>
          </PaginationContent>

          <PaginationContent>
            <PaginationItem>
              <span className="px-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Page {safeCurrentPage} of {totalPages}
              </span>
            </PaginationItem>
          </PaginationContent>

          <PaginationContent>
            <PaginationItem>
              <PaginationNext
                text="Next"
                onClick={onNext}
                disabled={safeCurrentPage >= totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
