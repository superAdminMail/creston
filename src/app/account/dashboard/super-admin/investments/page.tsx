import { getSuperAdminInvestments } from "@/actions/super-admin/investments/getSuperAdminInvestments";
import { SuperAdminRedirectToast } from "../_components/SuperAdminRedirectToast";
import { InvestmentsHeader } from "./_components/InvestmentsHeader";
import { InvestmentsTable } from "./_components/InvestmentsTable";

type SuperAdminInvestmentsPageProps = {
  searchParams?: Promise<{
    type?: string;
    status?: string;
    isActive?: string;
    toast?: string;
  }>;
};

export default async function SuperAdminInvestmentsPage({
  searchParams,
}: SuperAdminInvestmentsPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const data = await getSuperAdminInvestments({
    type: params?.type,
    status: params?.status,
    isActive: params?.isActive,
  });
  const toastMessage =
    params?.toast === "deleted"
      ? "Investment deleted successfully."
      : params?.toast === "not-found"
        ? "That investment could not be found."
        : null;
  const toastKind = params?.toast === "not-found" ? "error" : "success";

  return (
    <div className="space-y-6">
      {toastMessage ? (
        <SuperAdminRedirectToast message={toastMessage} kind={toastKind} />
      ) : null}
      <InvestmentsHeader />
      <InvestmentsTable data={data} />
    </div>
  );
}
