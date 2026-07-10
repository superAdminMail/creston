import CheckoutPageView from "../../../../checkout/_components/CheckoutPageView";

type PageProps = {
  params: Promise<{
    investmentOrderId: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function InvestmentOrderPaymentPage({
  params,
  searchParams,
}: PageProps) {
  const { investmentOrderId } = await params;
  const currentSearchParams = (await searchParams) ?? {};

  return (
    <CheckoutPageView
      searchParams={Promise.resolve({
        ...currentSearchParams,
        targetType: "INVESTMENT_ORDER",
        targetId: investmentOrderId,
      })}
    />
  );
}
