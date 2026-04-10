import AddSavingsAccount from "../../_components/AddSavingsAccount";

import { getSavingsProducts } from "@/actions/savings/getSavingsProducts";

export default async function NewSavingsAccountPage() {
  const products = await getSavingsProducts();

  return <AddSavingsAccount initialProducts={products} />;
}
