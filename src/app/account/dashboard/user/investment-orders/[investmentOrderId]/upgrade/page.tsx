export const dynamic = "force-dynamic";

import CheckoutPageView from "@/app/account/dashboard/checkout/_components/CheckoutPageView";

type PageProps = {
  params: Promise<{
    investmentOrderId: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function InvestmentOrderUpgradePage({
  params,
  searchParams,
}: PageProps) {
  const { investmentOrderId } = await params;
  const currentSearchParams = await searchParams;

  return (
    <CheckoutPageView
      searchParams={Promise.resolve({
        ...currentSearchParams,
        targetType: "INVESTMENT_ORDER",
        targetId: investmentOrderId,
        paymentMode: "FULL",
      })}
    />
  );
}
