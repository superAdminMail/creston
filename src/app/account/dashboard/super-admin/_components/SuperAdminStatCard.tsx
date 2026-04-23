import { Card, CardContent } from "@/components/ui/card";

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
    <Card className="rounded-[1.85rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(8,17,37,0.98))] shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
      <CardContent className="space-y-2 p-5">
        <p className="text-sm text-slate-400">{label}</p>
        <p className="text-2xl font-semibold text-white">{value}</p>
        {description ? (
          <p className="text-xs leading-6 text-slate-500">{description}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
