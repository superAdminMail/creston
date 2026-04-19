import { notFound } from "next/navigation";

import InvestmentOrderPaymentClient from "../user/investment-orders/[investmentOrderId]/payment/_components/InvestmentOrderPaymentClient";
import { getInvestmentOrderPaymentDetails } from "../user/investment-orders/[investmentOrderId]/payment/_lib/getInvestmentOrderPaymentDetails";

type CheckoutTargetType = "INVESTMENT_ORDER" | "SAVINGS_FUNDING";
type CheckoutPaymentMode = "FULL" | "PARTIAL";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type CheckoutRouteInput = {
  targetType: CheckoutTargetType;
  targetId: string;
  paymentMode: CheckoutPaymentMode | null;
};

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseCheckoutPaymentMode(
  value: string | string[] | undefined,
): CheckoutPaymentMode | null {
  const paymentMode = single(value);

  if (paymentMode === "FULL" || paymentMode === "PARTIAL") {
    return paymentMode;
  }

  return null;
}

function parseCheckoutRouteInput(
  searchParams: Record<string, string | string[] | undefined>,
): CheckoutRouteInput | null {
  const targetType = single(searchParams.targetType);

  if (targetType === "INVESTMENT_ORDER" || targetType === "SAVINGS_FUNDING") {
    const targetId = single(searchParams.targetId);
    const paymentMode = parseCheckoutPaymentMode(searchParams.paymentMode);

    if (!targetId) {
      return null;
    }

    if (
      searchParams.paymentMode !== undefined &&
      paymentMode === null
    ) {
      return null;
    }

    return {
      targetType,
      targetId,
      paymentMode,
    };
  }

  return null;
}

function SavingsFundingPlaceholder() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/88 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.94),rgba(5,11,31,0.98))]">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
          Shared checkout
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
          Savings funding coming soon
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
          This checkout entry point is reserved for savings funding flows. The
          investment order path remains active and unchanged while the savings
          implementation is added later.
        </p>
      </div>
    </div>
  );
}

export default async function CheckoutPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const routeInput = parseCheckoutRouteInput(params);

  if (!routeInput) {
    notFound();
  }

  switch (routeInput.targetType) {
    case "INVESTMENT_ORDER": {
      const order = await getInvestmentOrderPaymentDetails(routeInput.targetId);

      return <InvestmentOrderPaymentClient order={order} />;
    }
    case "SAVINGS_FUNDING":
      return <SavingsFundingPlaceholder />;
    default:
      notFound();
  }
}
