import { SavingsProductForm } from "../_components/SavingsProductForm";
import { SuperAdminRedirectToast } from "../_components/SuperAdminRedirectToast";

type PageProps = {
  searchParams?: Promise<{
    toast?: string;
  }>;
};

export default async function SuperAdminSavingsProductsPage({
  searchParams,
}: PageProps) {
  const params = searchParams ? await searchParams : undefined;

  const toastMessage =
    params?.toast === "created"
      ? "Savings product created successfully."
      : params?.toast === "error"
        ? "Something went wrong."
        : null;

  const toastKind = params?.toast === "error" ? "error" : "success";

  return (
    <div className="space-y-6">
      {toastMessage ? (
        <SuperAdminRedirectToast message={toastMessage} kind={toastKind} />
      ) : null}

      {/* HEADER */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">
          Savings Products
        </h1>
        <p className="text-sm text-muted-foreground">
          Create and manage savings products offered to users.
        </p>
      </div>

      {/* FORM */}
      <SavingsProductForm />
    </div>
  );
}
