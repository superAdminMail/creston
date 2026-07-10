import Link from "next/link";
import Image from "next/image";

import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";
import { getManagementList } from "@/actions/super-admin/management/getManagementList";
import { toggleManagementStatus } from "@/actions/super-admin/management/toggleManagementStatus";

export default async function ManagementListPage() {
  await requireSuperAdminAccess();

  const management = await getManagementList();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">
            Management Team
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Manage public-facing team members.
          </p>
        </div>

        <Link
          href="/account/dashboard/super-admin/management/new"
          className="btn-primary rounded-xl px-4 py-2"
        >
          + Add member
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {management.map((member) => (
          <div
            key={member.id}
            className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03]"
          >
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-slate-100/80 dark:bg-white/10">
                {member.photoFile?.url ? (
                  <Image
                    src={member.photoFile.url}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                ) : null}
              </div>

              <div>
                <p className="text-sm font-medium text-slate-950 dark:text-white">
                  {member.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {member.title || member.role}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span
                className={`text-xs ${
                  member.isActive
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-rose-700 dark:text-rose-400"
                }`}
              >
                {member.isActive ? "Active" : "Inactive"}
              </span>

              <form
                action={async () => {
                  "use server";
                  await toggleManagementStatus(member.id);
                }}
              >
                <button
                  type="submit"
                  className="text-xs text-sky-700 hover:underline dark:text-sky-300"
                >
                  Toggle
                </button>
              </form>
            </div>

            <div className="mt-4 flex justify-between text-xs">
              <Link
                href={`/account/dashboard/super-admin/management/${member.id}/edit`}
                className="text-sky-700 hover:underline dark:text-sky-300"
              >
                Edit
              </Link>

              <span className="text-slate-500 dark:text-slate-400">
                Order: {member.sortOrder}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="pt-12">
        {management.length === 0 && (
          <p className="col-span-full text-center text-sm text-slate-600 dark:text-slate-400">
            No management members found. Add one using the button above.
          </p>
        )}
      </div>
    </div>
  );
}
