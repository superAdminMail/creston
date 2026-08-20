"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, UserRound } from "lucide-react";
import { toast } from "sonner";

import type { MigrationStatus } from "@/generated/prisma";
import { updateUserMigrationAction } from "@/actions/super-admin/users/updateUserMigrationAction";
import type { UpdateUserMigrationState } from "@/actions/super-admin/users/updateUserMigrationAction";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DashboardActionSubmitButton } from "./DashboardActionSubmitButton";
import { DASHBOARD_PAGE_SURFACE_CLASS } from "./dashboardSurfaces";
import type { DashboardDirectoryUser } from "@/lib/types/dashboard";
import {
  formatMigrationTimelineTimestamp,
  getLegacyAccountBadgeMeta,
  getMigrationStatusMeta,
} from "@/lib/migration/migrationPresentation";

type Props = {
  users: DashboardDirectoryUser[];
  siteName: string;
  onMigrated?: (user: DashboardDirectoryUser) => void;
};

const initialState: UpdateUserMigrationState = {
  status: "idle",
};

export function UserMigrationControls({ users, siteName, onMigrated }: Props) {
  const [state, formAction] = useActionState(
    updateUserMigrationAction,
    initialState,
  );
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id ?? "");
  const [isLegacyUser, setIsLegacyUser] = useState(
    users[0]?.isLegacyUser ?? false,
  );
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus>(
    users[0]?.migrationStatus ?? "MIGRATION_PENDING",
  );
  const lastToastKey = useRef<string | null>(null);

  const selectedUser = useMemo(() => {
    return users.find((user) => user.id === selectedUserId) ?? null;
  }, [selectedUserId, users]);

  useEffect(() => {
    if (users.length === 0) {
      return;
    }

    if (!users.some((user) => user.id === selectedUserId)) {
      setSelectedUserId(users[0].id);
    }
  }, [selectedUserId, users]);

  useEffect(() => {
    if (!selectedUser) {
      return;
    }

    setIsLegacyUser(selectedUser.isLegacyUser);
    setMigrationStatus(selectedUser.migrationStatus ?? "MIGRATION_PENDING");
  }, [
    selectedUser?.id,
    selectedUser?.isLegacyUser,
    selectedUser?.migrationStatus,
  ]);

  useEffect(() => {
    if (state.status === "idle" || !state.message) {
      return;
    }

    const toastKey = `${state.status}:${state.message}:${state.userId ?? ""}`;

    if (lastToastKey.current === toastKey) {
      return;
    }

    lastToastKey.current = toastKey;

    if (state.status === "success") {
      toast.success(state.message);

      if (state.userId) {
        const target = users.find((user) => user.id === state.userId);

        if (target && onMigrated) {
          onMigrated({
            ...target,
            isLegacyUser: state.isLegacyUser ?? target.isLegacyUser,
            migrationStatus: state.migrationStatus ?? target.migrationStatus,
            migratedAt: state.migratedAt ?? target.migratedAt,
          });
        }
      }

      return;
    }

    toast.error(state.message);
  }, [
    onMigrated,
    state.isLegacyUser,
    state.message,
    state.migratedAt,
    state.migrationStatus,
    state.status,
    state.userId,
    users,
  ]);

  if (users.length === 0) {
    return null;
  }

  const selectedMeta = getMigrationStatusMeta(
    selectedUser?.migrationStatus ?? migrationStatus,
  );
  const legacyBadge = getLegacyAccountBadgeMeta(
    selectedUser?.isLegacyUser ?? isLegacyUser,
  );

  return (
    <Card className={DASHBOARD_PAGE_SURFACE_CLASS}>
      <CardHeader className="space-y-2 border-b border-border/60 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-200/70 bg-sky-50 text-sky-700 shadow-sm dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300">
            <UserRound className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-lg text-slate-950 dark:text-white">
              Legacy migration controls
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Mark a user as legacy, assign a migration status, and save the
              result as a deliberate admin action.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 p-4 sm:p-5">
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="userId" value={selectedUserId} />
          <input
            type="hidden"
            name="isLegacyUser"
            value={String(isLegacyUser)}
          />
          <input
            type="hidden"
            name="migrationStatus"
            value={isLegacyUser ? migrationStatus : ""}
          />

          <div className="space-y-2">
            <Label htmlFor="migration-user-id">Customer email</Label>
            <Select
              value={selectedUserId}
              onValueChange={setSelectedUserId}
              disabled={users.length === 0}
            >
              <SelectTrigger
                id="migration-user-id"
                className="h-11 rounded-2xl border-border/60 bg-white/90 text-left text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
              >
                <SelectValue placeholder="Choose a customer email" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.email}
                    {user.fullName ? ` - ${user.fullName}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              Select the account record you want to mark as legacy.
            </p>
            {state.fieldErrors?.userId?.[0] ? (
              <p className="text-xs text-rose-600 dark:text-rose-300">
                {state.fieldErrors.userId[0]}
              </p>
            ) : null}
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-950 dark:text-white">
                  Legacy user
                </p>
                <p className="text-xs text-slate-500">
                  Toggle this on for migrated accounts that should keep a legacy
                  badge.
                </p>
              </div>
              <Switch
                checked={isLegacyUser}
                onCheckedChange={(checked) => {
                  const nextLegacy = checked === true;
                  setIsLegacyUser(nextLegacy);

                  if (!nextLegacy) {
                    setMigrationStatus("MIGRATION_PENDING");
                  }
                }}
              />
            </div>
          </div>

          {isLegacyUser ? (
            <div className="space-y-2">
              <Label htmlFor="migration-status">Migration status</Label>
              <Select
                value={migrationStatus}
                onValueChange={(value) =>
                  setMigrationStatus(value as MigrationStatus)
                }
              >
                <SelectTrigger
                  id="migration-status"
                  className="h-11 rounded-2xl border-border/60 bg-white/90 text-left text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                >
                  <SelectValue placeholder="Choose migration status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEW_USER">New user</SelectItem>
                  <SelectItem value="MIGRATION_PENDING">
                    Migration pending
                  </SelectItem>
                  <SelectItem value="MIGRATED">Migrated</SelectItem>
                </SelectContent>
              </Select>
              {state.fieldErrors?.migrationStatus?.[0] ? (
                <p className="text-xs text-rose-600 dark:text-rose-300">
                  {state.fieldErrors.migrationStatus[0]}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="rounded-[1.35rem] border border-sky-200/70 bg-[linear-gradient(135deg,rgba(239,246,255,0.95),rgba(240,253,250,0.92))] p-4 shadow-sm dark:border-sky-400/20 dark:bg-sky-400/10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-slate-950 dark:text-white">
                {selectedUser?.fullName}
              </span>
              {legacyBadge ? (
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] ${legacyBadge.className}`}
                >
                  {legacyBadge.label}
                </span>
              ) : null}
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] ${selectedMeta.className}`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${selectedMeta.dotClassName}`}
                />
                {selectedMeta.label}
              </span>
            </div>

            <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">
              {selectedUser?.email}
            </p>

            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              {selectedUser?.migratedAt
                ? `Migrated on ${formatMigrationTimelineTimestamp(
                    selectedUser.migratedAt,
                  )}`
                : `Legacy records will show the ${siteName} migration timeline here once completed.`}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <DashboardActionSubmitButton
              idleLabel="Save migration"
              pendingLabel="Saving..."
              pendingIcon={<Loader2 className="h-4 w-4 animate-spin" />}
              className="rounded-full bg-[#3c9ee0] px-5 text-white shadow-[0_18px_40px_-22px_rgba(60,158,224,0.9)] hover:bg-[#2f8bd0]"
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
