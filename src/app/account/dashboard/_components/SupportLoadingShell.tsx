import { cn } from "@/lib/utils";
import { DashboardSectionCard } from "./DashboardSectionCard";

type SupportLoadingShellProps = {
  titleWidthClass: string;
  variant?: "support" | "conversation";
};

export function SupportLoadingShell({
  titleWidthClass,
  variant = "support",
}: SupportLoadingShellProps) {
  const isConversationVariant = variant === "conversation";

  return (
    <div
      className={cn(
        "mx-auto min-h-[calc(100dvh-7rem)] px-4 py-4 sm:px-6 lg:px-8",
        isConversationVariant ? "max-w-7xl" : "max-w-[1600px]",
      )}
    >
      <div className="space-y-6">
        <DashboardSectionCard>
          <div
            className={cn(
              "animate-pulse rounded-full bg-white/10",
              isConversationVariant ? "h-4" : "h-10",
              titleWidthClass,
            )}
          />
          <div
            className={cn(
              "animate-pulse rounded-2xl bg-white/10",
              isConversationVariant ? "mt-4 h-8 w-3/4" : "mt-5 h-10 w-2/3",
            )}
          />
          <div
            className={cn(
              "animate-pulse rounded-full bg-white/10",
              isConversationVariant
                ? "mt-3 h-4 w-full max-w-2xl"
                : "mt-3 h-4 w-1/2",
            )}
          />
        </DashboardSectionCard>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="rounded-[1.9rem] border border-white/10 bg-white/[0.03] p-5">
            <div
              className={cn(
                "animate-pulse rounded-[1.5rem] bg-white/5",
                isConversationVariant ? "h-[32rem]" : "h-[36rem]",
              )}
            />
          </div>
          <div className="rounded-[1.9rem] border border-white/10 bg-white/[0.03] p-5">
            <div
              className={cn(
                "animate-pulse rounded-[1.5rem] bg-white/5",
                isConversationVariant ? "h-[32rem]" : "h-[36rem]",
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
