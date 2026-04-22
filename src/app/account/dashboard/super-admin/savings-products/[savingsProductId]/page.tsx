import { getSuperAdminSavingsProductById } from "@/actions/super-admin/savings-products/getSuperAdminSavingsProductById";
import { SuperAdminRedirectToast } from "../../_components/SuperAdminRedirectToast";
import { SavingsProductDetailsCard } from "../_components/SavingsProductDetailsCard";

export default async function SuperAdminSavingsProductDetailsPage(
  props: PageProps<
    "/account/dashboard/super-admin/savings-products/[savingsProductId]"
  >,
) {
  const { savingsProductId } = await props.params;
  const searchParams = await props.searchParams;
  const product = await getSuperAdminSavingsProductById(savingsProductId);

  const toastMessage =
    searchParams.toast === "created"
      ? "Savings product created successfully."
      : searchParams.toast === "updated"
        ? "Savings product updated successfully."
        : searchParams.toast === "not-found"
          ? "That savings product could not be found."
          : null;
  const toastKind = searchParams.toast === "not-found" ? "error" : "success";

  return (
    <>
      {toastMessage ? (
        <SuperAdminRedirectToast message={toastMessage} kind={toastKind} />
      ) : null}
      <SavingsProductDetailsCard product={product} />
    </>
  );
}
