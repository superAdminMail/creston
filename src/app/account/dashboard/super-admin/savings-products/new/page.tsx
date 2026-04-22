import { createSavingsProduct } from "@/actions/super-admin/savings-products/createSavingsProduct";
import { SavingsProductForm } from "../../_components/SavingsProductForm";

export default async function NewSavingsProductPage() {
  return (
    <SavingsProductForm
      title="Create savings product"
      description="Define the balance rules, availability, and interest behavior for a new savings product."
      submitLabel="Create savings product"
      cancelHref="/account/dashboard/super-admin/savings-products"
      defaultValues={{
        name: "",
        description: "",
        interestEnabled: false,
        interestRatePercent: "",
        interestPayoutFrequency: "",
        isLockable: false,
        minimumLockDays: "",
        maximumLockDays: "",
        allowsWithdrawals: true,
        allowsDeposits: true,
        minBalance: "",
        maxBalance: "",
        currency: "USD",
        isActive: true,
        sortOrder: "0",
      }}
      formAction={createSavingsProduct}
    />
  );
}
