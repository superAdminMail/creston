import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{
    investmentOrderId: string;
  }>;
};

export default async function InvestmentOrderPaymentPage({
  params,
}: PageProps) {
  const { investmentOrderId } = await params;
  redirect(
    `/account/dashboard/checkout?targetType=INVESTMENT_ORDER&targetId=${investmentOrderId}`,
  );
}
