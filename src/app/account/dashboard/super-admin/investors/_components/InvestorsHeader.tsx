import { SuperAdminPageHeader } from "../../_components/SuperAdminPageHeader";

export function InvestorsHeader() {
  return (
    <SuperAdminPageHeader
      backHref="/account/dashboard/super-admin"
      backLabel="Back to dashboard"
      title="Investors"
      description="Review investor profiles, verification state, and linked account activity from one super-admin workspace."
    />
  );
}
