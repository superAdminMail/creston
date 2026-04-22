"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { Prisma } from "@/generated/prisma";
import {
  InvestmentCatalogStatus,
  InvestmentOrderStatus,
  KycStatus,
  UserRole,
} from "@/generated/prisma";
import { formatCurrency } from "@/lib/formatters/formatters";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { prisma } from "@/lib/prisma";
import { createRealtimeNotification } from "@/lib/notifications/createNotification";
import {
  createInvestmentOrderSchema,
  parseInvestmentOrderAmount,
} from "@/lib/zodValidations/investment-order";
import type {
  CreateInvestmentOrderActionState,
  OrderFieldName,
} from "./createInvestmentOrder.state";
import { getPrice } from "@/lib/services/price/priceService";

function getFormValue(formData: FormData, key: OrderFieldName) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function getFieldErrors(error: Parameters<typeof createErrorState>[1]) {
  return error;
}

function createErrorState(
  message: string,
  fieldErrors?: Partial<Record<OrderFieldName, string>>,
): CreateInvestmentOrderActionState {
  return {
    status: "error",
    message,
    fieldErrors,
  };
}

function toNumber(value: { toNumber(): number } | number) {
  if (typeof value === "number") return value;
  return value.toNumber();
}

async function assertUserCanCreateInvestmentOrder(input: {
  investorProfileId: string;
}) {
  const activeUnpaidOrders = await prisma.investmentOrder.count({
    where: {
      investorProfileId: input.investorProfileId,
      status: {
        in: [
          InvestmentOrderStatus.PENDING_PAYMENT,
          InvestmentOrderStatus.PARTIALLY_PAID,
        ],
      },
    },
  });

  if (activeUnpaidOrders >= 3) {
    return createErrorState(
      "You already have 3 active unpaid orders. Please complete or cancel an existing order before creating a new one.",
    );
  }

  return null;
}

async function notifyAdminsAboutInvestmentOrderCreated(input: {
  orderId: string;
  investorName: string;
  investorId: string;
  investmentName: string;
  planName: string;
  amount: number;
  currency: string;
}) {
  const admins = await prisma.user.findMany({
    where: {
      isDeleted: false,
      role: {
        in: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
      },
    },
    select: {
      id: true,
      role: true,
    },
  });

  if (!admins.length) {
    return;
  }

  const link = `/account/dashboard/admin/investment-orders/${input.orderId}`;
  const title = "New investment order";
  const message = `${input.investorName} created ${
    input.planName || input.investmentName || "an investment order"
  } for ${formatCurrency(input.amount, input.currency)}.`;

  const results = await Promise.allSettled(
    admins.map((admin) =>
      createRealtimeNotification({
        userId: admin.id,
        event: "INVESTMENT_ORDER",
        title,
        message,
        link,
        key: `investment-order-created:${input.orderId}:${admin.id}`,
        metadata: {
          kind: "investment_order_created",
          orderId: input.orderId,
          investorId: input.investorId,
          investorName: input.investorName,
          investmentName: input.investmentName,
          planName: input.planName,
          amount: input.amount,
          currency: input.currency,
          adminRole: admin.role,
        },
      }),
    ),
  );

  const failed = results.filter((result) => result.status === "rejected");

  if (failed.length > 0) {
    console.error("Failed to notify some admins about investment order", {
      orderId: input.orderId,
      failedCount: failed.length,
    });
  }
}

async function notifyInvestorAboutInvestmentOrderCreated(input: {
  orderId: string;
  userId: string;
  investorName: string;
  investmentName: string;
  planName: string;
  amount: number;
  currency: string;
}) {
  await createRealtimeNotification({
    userId: input.userId,
    event: "INVESTMENT_ORDER",
    title: "Investment order created successfully",
    message: `Your ${input.planName || input.investmentName || "investment"} order for ${formatCurrency(
      input.amount,
      input.currency,
    )} has been created successfully.`,
    link: `/account/dashboard/user/investment-orders/${input.orderId}`,
    key: `investment-order-user-created:${input.orderId}:${input.userId}`,
    metadata: {
      kind: "investment_order_created",
      orderId: input.orderId,
      investorId: input.userId,
      investorName: input.investorName,
      investmentName: input.investmentName,
      planName: input.planName,
      amount: input.amount,
      currency: input.currency,
      audience: "USER",
    },
  });
}

export async function createInvestmentOrder(
  _previousState: CreateInvestmentOrderActionState,
  formData: FormData,
): Promise<CreateInvestmentOrderActionState> {
  const user = await getCurrentSessionUser();

  if (!user?.id) {
    return createErrorState("Please sign in to continue.");
  }

  const investorProfile = await prisma.investorProfile.findUnique({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
      kycStatus: true,
    },
  });

  if (!investorProfile?.id) {
    return createErrorState(
      "Complete your investment profile before creating an investment order.",
    );
  }

  if (investorProfile.kycStatus !== KycStatus.VERIFIED) {
    return createErrorState(
      "Verify your KYC before creating an investment order.",
    );
  }

  const rawValues = {
    investmentId: getFormValue(formData, "investmentId"),
    investmentPlanId: getFormValue(formData, "investmentPlanId"),
    investmentPlanTierId: getFormValue(formData, "investmentPlanTierId"),
    amount: getFormValue(formData, "amount"),
  };

  const parsedValues = createInvestmentOrderSchema.safeParse(rawValues);

  if (!parsedValues.success) {
    const flattened = parsedValues.error.flatten().fieldErrors;

    return createErrorState(
      "Please review the highlighted fields before continuing.",
      getFieldErrors({
        investmentId: flattened.investmentId?.[0],
        investmentPlanId: flattened.investmentPlanId?.[0],
        investmentPlanTierId: flattened.investmentPlanTierId?.[0],
        amount: flattened.amount?.[0],
      }),
    );
  }

  const amount = parseInvestmentOrderAmount(parsedValues.data.amount);

  if (amount === null) {
    return createErrorState("Enter a valid investment amount.", {
      amount: "Enter a valid investment amount.",
    });
  }

  const selectedPlan = await prisma.investmentPlan.findUnique({
      where: {
        id: parsedValues.data.investmentPlanId,
      },
      select: {
        id: true,
        name: true,
        currency: true,
        isActive: true,
        investmentModel: true,
        investment: {
          select: {
            id: true,
            name: true,
            isActive: true,
            status: true,
            symbol: true,
          },
        },
        tiers: {
          where: {
            id: parsedValues.data.investmentPlanTierId,
          },
          select: {
            id: true,
            level: true,
            minAmount: true,
            maxAmount: true,
            fixedRoiPercent: true,
            projectedRoiMin: true,
            projectedRoiMax: true,
            isActive: true,
          },
        },
      },
    });

  if (!selectedPlan?.isActive) {
    return createErrorState(
      "The selected investment plan is no longer available. Choose another plan to continue.",
      {
        investmentPlanId: "The selected plan is no longer available.",
      },
    );
  }

  const selectedTier = selectedPlan.tiers[0];

  if (!selectedTier?.isActive) {
    return createErrorState(
      "The selected investment tier is no longer available. Choose another tier to continue.",
      {
        investmentPlanTierId: "The selected tier is no longer available.",
      },
    );
  }

  if (
    !selectedPlan.investment.isActive ||
    selectedPlan.investment.status !== InvestmentCatalogStatus.ACTIVE
  ) {
    return createErrorState(
      "The selected investment product is currently unavailable. Choose another option to continue.",
      {
        investmentPlanId:
          "The selected investment product is currently unavailable.",
      },
    );
  }

  if (parsedValues.data.investmentId !== selectedPlan.investment.id) {
    return createErrorState(
      "Select a plan that belongs to the chosen investment.",
      {
        investmentId: `Choose a plan from ${selectedPlan.investment.name} to continue.`,
      },
    );
  }

  const orderLimitError = await assertUserCanCreateInvestmentOrder({
    investorProfileId: investorProfile.id,
  });

  if (orderLimitError) {
    return orderLimitError;
  }

  const minAmount = toNumber(selectedTier.minAmount);
  const maxAmount = toNumber(selectedTier.maxAmount);

  if (amount < minAmount || amount > maxAmount) {
    return createErrorState(
      `Enter an amount between ${formatCurrency(
        minAmount,
        selectedPlan.currency,
      )} and ${formatCurrency(maxAmount, selectedPlan.currency)}.`,
      {
        amount: `Allowed range: ${formatCurrency(
          minAmount,
          selectedPlan.currency,
        )} to ${formatCurrency(maxAmount, selectedPlan.currency)}.`,
      },
    );
  }

  let investmentAccount = await prisma.investmentAccount.findFirst({
    where: {
      investorProfileId: investorProfile.id,
      investmentPlanId: selectedPlan.id,
    },
    select: {
      id: true,
      status: true,
      openedAt: true,
    },
  });

  if (!investmentAccount) {
    const openedAt = new Date();

    investmentAccount = await prisma.investmentAccount.upsert({
      where: {
        investorProfileId_investmentPlanId: {
          investorProfileId: investorProfile.id,
          investmentPlanId: selectedPlan.id,
        },
      },
      update: {},
      create: {
        investorProfileId: investorProfile.id,
        investmentPlanId: selectedPlan.id,
        currency: selectedPlan.currency,
        status: "ACTIVE",
        openedAt,
      },
    });
  }

  if (investmentAccount.status === "ACTIVE" && !investmentAccount.openedAt) {
    investmentAccount = await prisma.investmentAccount.update({
      where: {
        id: investmentAccount.id,
      },
      data: {
        openedAt: new Date(),
      },
      select: {
        id: true,
        status: true,
        openedAt: true,
      },
    });
  }

  if (investmentAccount.status !== "ACTIVE") {
    return createErrorState(
      "Your investment account is not active. Please contact support.",
    );
  }

  //market calculation logic
  let units: Prisma.Decimal | null = null;
  let entryPrice: Prisma.Decimal | null = null;
  let currentValue: Prisma.Decimal | null = null;

  if (selectedPlan.investmentModel === "MARKET") {
    const symbol = selectedPlan.investment.symbol;

    if (!symbol) {
      return createErrorState(
        "This investment is temporarily unavailable for market pricing.",
      );
    }

    try {
      const price = await getPrice(symbol);

      const numericAmount = amount;

      const calculatedUnits = numericAmount / price;

      units = new Prisma.Decimal(calculatedUnits);
      entryPrice = new Prisma.Decimal(price);
      currentValue = new Prisma.Decimal(numericAmount);
    } catch (error) {
      console.error("Price fetch failed:", error);

      return createErrorState(
        "Unable to fetch market price. Please try again.",
      );
    }
  }

  const order = await prisma.investmentOrder.create({
    data: {
      investorProfileId: investorProfile.id,
      investmentPlanId: selectedPlan.id,
      investmentPlanTierId: selectedTier.id,
      investmentAccountId: investmentAccount.id,

      investmentModel: selectedPlan.investmentModel,

      amount: new Prisma.Decimal(amount.toFixed(2)),
      currency: selectedPlan.currency,
      status: InvestmentOrderStatus.PENDING_PAYMENT,
      commissionPercent: new Prisma.Decimal(0),

      units,
      entryPrice,
      currentValue,
    },
    select: {
      id: true,
    },
  });

  const investorName =
    user.name?.trim() || user.email?.trim() || "Investor";

  await notifyAdminsAboutInvestmentOrderCreated({
    orderId: order.id,
    investorName,
    investorId: user.id,
    investmentName: selectedPlan.investment.name,
    planName: selectedPlan.name,
    amount,
    currency: selectedPlan.currency,
  });

  await notifyInvestorAboutInvestmentOrderCreated({
    orderId: order.id,
    userId: user.id,
    investorName,
    investmentName: selectedPlan.investment.name,
    planName: selectedPlan.name,
    amount,
    currency: selectedPlan.currency,
  });

  revalidatePath("/account/dashboard/notifications");

  redirect(`/account/dashboard/user/investment-orders?created=${order.id}`);
}
