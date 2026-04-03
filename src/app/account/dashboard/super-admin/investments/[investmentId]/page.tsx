import { getSuperAdminInvestmentById } from "@/actions/super-admin/investments/getSuperAdminInvestmentById";
import { SuperAdminRedirectToast } from "../../_components/SuperAdminRedirectToast";
import { InvestmentDetailsCard } from "../_components/InvestmentDetailsCard";

export default async function SuperAdminInvestmentDetailsPage(
  props: PageProps<
    "/account/dashboard/super-admin/investments/[investmentId]"
  >,
) {
  const { investmentId } = await props.params;
  const searchParams = await props.searchParams;
  const investment = await getSuperAdminInvestmentById(investmentId);

  const toastMessage =
    searchParams.toast === "created"
      ? "Investment created successfully."
      : searchParams.toast === "updated"
        ? "Investment updated successfully."
        : searchParams.toast === "delete-blocked-plans"
          ? "This investment cannot be deleted while it still has linked plans."
        : null;
  const toastKind =
    searchParams.toast === "delete-blocked-plans" ? "error" : "success";

  return (
    <>
      {toastMessage ? (
        <SuperAdminRedirectToast message={toastMessage} kind={toastKind} />
      ) : null}
      <InvestmentDetailsCard investment={investment} />
    </>
  );
}
