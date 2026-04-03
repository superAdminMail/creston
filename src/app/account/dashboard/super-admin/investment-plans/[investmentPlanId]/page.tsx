import { getSuperAdminInvestmentPlanById } from "@/actions/super-admin/investment-plans/getSuperAdminInvestmentPlanById";
import { SuperAdminRedirectToast } from "../../_components/SuperAdminRedirectToast";
import { InvestmentPlanDetailsCard } from "../_components/InvestmentPlanDetailsCard";

export default async function SuperAdminInvestmentPlanDetailsPage(
  props: PageProps<
    "/account/dashboard/super-admin/investment-plans/[investmentPlanId]"
  >,
) {
  const { investmentPlanId } = await props.params;
  const searchParams = await props.searchParams;
  const plan = await getSuperAdminInvestmentPlanById(investmentPlanId);

  const toastMessage =
    searchParams.toast === "created"
      ? "Investment plan created successfully."
      : searchParams.toast === "updated"
        ? "Investment plan updated successfully."
        : searchParams.toast === "delete-blocked-orders"
          ? "This investment plan cannot be deleted while it still has linked orders."
          : searchParams.toast === "delete-blocked-accounts"
            ? "This investment plan cannot be deleted while it still has linked accounts."
        : null;
  const toastKind =
    searchParams.toast === "delete-blocked-orders" ||
    searchParams.toast === "delete-blocked-accounts"
      ? "error"
      : "success";

  return (
    <>
      {toastMessage ? (
        <SuperAdminRedirectToast message={toastMessage} kind={toastKind} />
      ) : null}
      <InvestmentPlanDetailsCard plan={plan} />
    </>
  );
}
