import { getAdminSavingsProducts } from "@/lib/service/getAdminCatalogData";
import { SuperAdminRedirectToast } from "../_components/SuperAdminRedirectToast";
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

      <section className="grid gap-4 md:grid-cols-3">
        <div className="card-premium rounded-[1.75rem] p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Total products
          </p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {products.length}
          </p>
          <p className="mt-2 text-sm text-slate-400">Savings products configured</p>
        </div>
        <div className="card-premium rounded-[1.75rem] p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Active products
          </p>
          <p className="mt-3 text-3xl font-semibold text-white">{activeProducts}</p>
          <p className="mt-2 text-sm text-slate-400">Currently available to users</p>
        </div>
        <div className="card-premium rounded-[1.75rem] p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Deposit enabled
          </p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {depositEnabled}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Products accepting deposits
          </p>
        </div>
      </section>

      <SavingsProductsTable data={products} />
    </div>
  );
}
