import Link from "next/link";

import { getTestimonies } from "@/actions/admin/testimonies/getTestimonies";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminTestimoniesPage() {
  await requireDashboardRoleAccess(["ADMIN", "SUPER_ADMIN"]);
  const testimonies = await getTestimonies();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Testimonies</h1>
          <p className="text-sm text-slate-400">
            Manage public customer testimonies.
          </p>
        </div>

        <Link
          href="/account/dashboard/admin/testimonies/new"
          className="btn-primary rounded-xl px-4 py-2"
        >
          + Add testimony
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {testimonies.map((testimony) => (
          <Card key={testimony.id} className="rounded-[1.75rem] border border-white/10 bg-white/[0.03]">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{testimony.fullName}</p>
                  <p className="text-xs text-slate-400">{testimony.roleOrTitle ?? "CLIENT"}</p>
                </div>
                <span className="text-xs text-slate-500">{testimony.status}</span>
              </div>
              <p className="text-sm leading-6 text-slate-300">{testimony.message}</p>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{testimony.rating ? `${testimony.rating}/5` : "No rating"}</span>
                <span>{testimony.isFeatured ? "Featured" : "Standard"}</span>
              </div>
              <Link
                href={`/account/dashboard/admin/testimonies/${testimony.id}/edit`}
                className="text-sm text-blue-400 hover:underline"
              >
                Edit
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {testimonies.length === 0 ? (
        <Card className="rounded-[1.75rem] border border-white/10 bg-white/[0.03]">
          <CardContent className="p-8 text-center text-sm text-slate-400">
            No testimonies found. Add one using the button above.
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
