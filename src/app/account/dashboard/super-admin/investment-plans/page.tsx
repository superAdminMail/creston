import { getSuperAdminInvestmentPlans } from "@/actions/super-admin/investment-plans/getSuperAdminInvestmentPlans";
import { SuperAdminRedirectToast } from "../_components/SuperAdminRedirectToast";
import { InvestmentPlansHeader } from "./_components/InvestmentPlansHeader";
import { InvestmentPlansTable } from "./_components/InvestmentPlansTable";

type SuperAdminInvestmentPlansPageProps = {
  searchParams?: Promise<{
    investmentId?: string;
    period?: string;
    currency?: string;
    isActive?: string;
    toast?: string;
  }>;
};

export default async function SuperAdminInvestmentPlansPage({
  searchParams,
}: SuperAdminInvestmentPlansPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const data = await getSuperAdminInvestmentPlans({
    investmentId: params?.investmentId,
    period: params?.period,
    currency: params?.currency,
    isActive: params?.isActive,
  });
  const toastMessage =
    params?.toast === "deleted"
      ? "Investment plan deleted successfully."
      : params?.toast === "not-found"
        ? "That investment plan could not be found."
        : null;
  const toastKind = params?.toast === "not-found" ? "error" : "success";

  return (
    <div className="space-y-6">
      {toastMessage ? (
        <SuperAdminRedirectToast message={toastMessage} kind={toastKind} />
      ) : null}
      <InvestmentPlansHeader />
      <InvestmentPlansTable data={data} />
    </div>
  );
}
