"use client";

import { UserRole } from "@/generated/prisma/client";
import type { NewConversation } from "@/lib/types/chat.types";
import type {
  SupportConversationPreview,
  SupportInboxMode,
} from "@/lib/support/supportConversationView";
import type { SupportVerificationPreview } from "@/actions/admin/support/getSupportVerificationsAction";

import SupportVerificationDialog, {
  SupportVerificationUserOption,
} from "../dialogs/SupportVerificationDialog";
import SupportInboxHeader from "./SupportInboxHeader";
import SupportInboxToolbar from "./SupportInboxToolbar";
import SupportConversationList from "./SupportConversationList";
import SupportStaffSidebar from "./staff/SupportStaffSidebar";
import SupportInboxFilters from "./SupportInboxFilters";
import CreateSupportTicketDialog from "../dialogs/CreateSupportTicketDialog";
import SupportBulkDeleteDialog from "../dialogs/SupportBulkDeleteDialog";
import SupportUserSidebar from "./user/SupportUserSidebar";
import { useSupportInbox } from "@/hooks/useSupportInbox";

type Props = {
  mode: SupportInboxMode;
  viewerId: string;
  viewerRole: UserRole;
  siteName: string;
  initialConversations: SupportConversationPreview[];
  users?: SupportVerificationUserOption[];
  detailBasePath?: string;
  verifications?: SupportVerificationPreview[];
};

export default function SupportInboxWorkspace({
  mode,
  viewerId,
  viewerRole,
  siteName,
  initialConversations,
  detailBasePath,
  users = [],
  verifications = [],
}: Props) {
  const {
    filteredConversations,
    stats,
    query,
    setQuery,
    filter,
    setFilter,
    sort,
    setSort,
    filters,
    isStaffView,
    canDeleteTickets,
    isPending,
    createOpen,
    setCreateOpen,
    supportVerificationOpen,
    setSupportVerificationOpen,
    deleteOpen,
    handleDeleteDialogOpenChange,
    deleteConversationIds,
    selectedConversationIds,
    selectedCount,
    allVisibleSelected,
    someVisibleSelected,
    handleSelect,
    handleAssignToMe,
    handleDelete,
    confirmDelete,
    toggleConversationSelection,
    toggleAllVisibleSelection,
    clearSelection,
    handleBatchDelete,
    handleCreated,
  } = useSupportInbox({
    mode,
    viewerId,
    viewerRole,
    initialConversations,
    detailBasePath,
  });

  return (
    <div className="space-y-6">
      <SupportInboxHeader
        mode={mode}
        viewerRole={viewerRole}
        onCreateTicket={() => setCreateOpen(true)}
        onSendVerification={() => setSupportVerificationOpen(true)}
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-5">
          <div className="rounded-[1.9rem] border border-slate-200/80 bg-white/75 p-5 dark:border-white/10 dark:bg-white/[0.04]">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
              <span className="h-2 w-2 rounded-full bg-sky-500" />
              Tickets
            </div>

            <SupportInboxToolbar
              query={query}
              onQueryChange={setQuery}
              sort={sort}
              onSortChange={setSort}
              canDeleteTickets={canDeleteTickets}
              selectedCount={selectedCount}
              allVisibleSelected={allVisibleSelected}
              someVisibleSelected={someVisibleSelected}
              onToggleAllVisible={toggleAllVisibleSelection}
              onClearSelection={clearSelection}
              onBatchDelete={handleBatchDelete}
            />

            <div className="mt-5">
              <SupportInboxFilters
                filters={filters}
                activeFilter={filter}
                onFilterChange={setFilter}
              />
            </div>

            <div className="my-5 border-t border-slate-200/80 dark:border-white/10" />

            <SupportConversationList
              conversations={filteredConversations}
              viewerRole={viewerRole}
              isStaffView={isStaffView}
              canManageTickets={
                isStaffView &&
                (viewerRole === UserRole.ADMIN ||
                  viewerRole === UserRole.SUPER_ADMIN)
              }
              canDeleteTickets={canDeleteTickets}
              isPending={isPending}
              selectedConversationIds={selectedConversationIds}
              onSelect={handleSelect}
              onAssignToMe={handleAssignToMe}
              onDelete={handleDelete}
              onToggleSelection={toggleConversationSelection}
            />
          </div>
        </div>

        {isStaffView ? (
          <SupportStaffSidebar stats={stats} verifications={verifications} />
        ) : (
          <SupportUserSidebar
            stats={stats}
            onCreateTicket={() => setCreateOpen(true)}
          />
        )}
      </section>

      {!isStaffView ? (
        <CreateSupportTicketDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onCreated={(conversation: NewConversation) =>
            handleCreated(conversation)
          }
        />
      ) : null}

      {isStaffView ? (
        <SupportVerificationDialog
          siteName={siteName}
          open={supportVerificationOpen}
          onOpenChange={setSupportVerificationOpen}
          users={users}
        />
      ) : null}

      {canDeleteTickets ? (
        <SupportBulkDeleteDialog
          open={deleteOpen}
          onOpenChange={handleDeleteDialogOpenChange}
          onConfirm={confirmDelete}
          isPending={isPending}
          conversationCount={deleteConversationIds?.length ?? 1}
        />
      ) : null}
    </div>
  );
}
