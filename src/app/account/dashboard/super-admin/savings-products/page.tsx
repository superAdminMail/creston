import { getAdminSavingsProducts } from "@/lib/service/getAdminCatalogData";
import { SuperAdminRedirectToast } from "../_components/SuperAdminRedirectToast";
import { SuperAdminStatCard } from "../_components/SuperAdminStatCard";
import { SavingsProductsHeader } from "./_components/SavingsProductsHeader";
import { SavingsProductsTable } from "./_components/SavingsProductsTable";

type PageProps = {
  searchParams?: Promise<{
    toast?: string;
  }>;
};

export default async function SuperAdminSavingsProductsPage({
  searchParams,
}: PageProps) {
  const params = searchParams ? await searchParams : undefined;
  const products = await getAdminSavingsProducts();

  const toastMessage =
    params?.toast === "created"
      ? "Savings product created successfully."
      : params?.toast === "updated"
        ? "Savings product updated successfully."
        : params?.toast === "not-found"
          ? "That savings product could not be found."
          : null;
  const toastKind = params?.toast === "not-found" ? "error" : "success";

  const activeProducts = products.filter((product) => product.isActive).length;
  const depositEnabled = products.filter((product) => product.allowsDeposits).length;

  return (
    <div className="space-y-6">
      {toastMessage ? (
        <SuperAdminRedirectToast message={toastMessage} kind={toastKind} />
      ) : null}

      <SavingsProductsHeader />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SuperAdminStatCard
          label="Total products"
          value={products.length}
          description="Savings products configured."
        />
        <SuperAdminStatCard
          label="Active products"
          value={activeProducts}
          description="Currently available to users."
        />
        <SuperAdminStatCard
          label="Deposit enabled"
          value={depositEnabled}
          description="Products accepting deposits."
        />
      </section>

      <SavingsProductsTable data={products} />
    </div>
  );
}
