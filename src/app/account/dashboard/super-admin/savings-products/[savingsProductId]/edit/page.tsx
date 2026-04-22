import { notFound } from "next/navigation";

import { getSuperAdminSavingsProductById } from "@/actions/super-admin/savings-products/getSuperAdminSavingsProductById";
import { updateSavingsProduct } from "@/actions/super-admin/savings-products/updateSavingsProduct";
import { SavingsProductForm } from "../../../_components/SavingsProductForm";

type PageProps = {
  params: Promise<{
    savingsProductId: string;
  }>;
};

export default async function EditSavingsProductPage({ params }: PageProps) {
  const { savingsProductId } = await params;
  const product = await getSuperAdminSavingsProductById(savingsProductId);

  if (!product) {
    notFound();
  }

  return (
    <SavingsProductForm
      title="Edit savings product"
      description="Update the product's balance rules, interest configuration, and availability without breaking linked accounts."
      submitLabel="Save changes"
      cancelHref={`/account/dashboard/super-admin/savings-products/${product.id}`}
      defaultValues={product.formDefaults}
      formAction={updateSavingsProduct.bind(null, product.id)}
    />
  );
}
