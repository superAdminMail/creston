import { Card, CardContent } from "@/components/ui/card";
import { DASHBOARD_PAGE_SURFACE_CLASS } from "../../_components/dashboardSurfaces";

type SuperAdminStatCardProps = {
  label: string;
  value: string | number;
  description?: string;
};

export function SuperAdminStatCard({
  label,
  value,
  description,
}: SuperAdminStatCardProps) {
  return (
    <Card className={DASHBOARD_PAGE_SURFACE_CLASS}>
      <CardContent className="space-y-2 p-5">
        <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
        <p className="text-2xl font-semibold text-slate-950 dark:text-white">
          {value}
        </p>
        {description ? (
          <p className="text-xs leading-6 text-slate-500 dark:text-slate-500">
            {description}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
