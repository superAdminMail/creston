import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type ResponsiveCollectionLoadingProps = {
  mobileCards: number;
  desktopColumns: number;
  desktopRows: number;
  mobileCardFields?: number;
  tableMinWidthClassName?: string;
  cardClassName?: string;
  tableClassName?: string;
};

export function ResponsiveCollectionLoading({
  mobileCards,
  desktopColumns,
  desktopRows,
  mobileCardFields = 4,
  tableMinWidthClassName = "min-w-[960px]",
  cardClassName,
  tableClassName,
}: ResponsiveCollectionLoadingProps) {
  return (
    <>
      <div className="grid gap-3 md:hidden">
        {Array.from({ length: mobileCards }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "rounded-[1.35rem] border border-border/60 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]",
              cardClassName,
            )}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 rounded-full bg-white/10" />
                <Skeleton className="h-5 w-3/4 rounded-2xl bg-white/10" />
                <Skeleton className="h-4 w-full rounded-full bg-white/10" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: mobileCardFields }).map((__, field) => (
                  <div key={field} className="space-y-1.5">
                    <Skeleton className="h-3 w-20 rounded-full bg-white/10" />
                    <Skeleton className="h-4 w-full rounded-full bg-white/10" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block">
        <div
          className={cn(
            "overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white/90 shadow-sm dark:border-white/10 dark:bg-white/[0.04]",
            tableClassName,
          )}
        >
          <div className="overflow-x-auto">
            <table className={cn("w-full text-left", tableMinWidthClassName)}>
              <thead className="bg-white/80 dark:bg-white/[0.04]">
                <tr className="border-b border-slate-200/80 dark:border-white/10">
                  {Array.from({ length: desktopColumns }).map((_, index) => (
                    <th key={index} className="px-4 py-4">
                      <Skeleton className="h-3 w-24 rounded-full bg-white/10" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: desktopRows }).map((_, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-b border-slate-200/80 last:border-b-0 dark:border-white/10"
                  >
                    {Array.from({ length: desktopColumns }).map(
                      (__, cellIndex) => (
                        <td key={cellIndex} className="px-4 py-4">
                          <Skeleton className="h-4 w-full max-w-44 rounded-full bg-white/10" />
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
