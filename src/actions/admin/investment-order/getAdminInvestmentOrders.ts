"use server";

import { InvestmentOrderStatus } from "@/generated/prisma";
import { formatCurrency, formatDateLabel, formatEnumLabel } from "@/lib/formatters/formatters";
import { prisma } from "@/lib/prisma";

import {
  assertAdminInvestmentOrderAccess,
  canConfirmInvestmentOrderStatus,
  formatStatusLabel,
} from "./adminInvestmentOrder.shared";

export type AdminInvestmentOrderListItem = {
  id: string;
  investorName: string;
  investorEmail: string;
  amount: string;
  amountValue: number;
  currency: string;
  status: InvestmentOrderStatus;
  statusLabel: string;
  modelLabel: string;
  createdAtLabel: string;
  confirmedAtLabel: string;
  paymentReference: string;
  accountName: string;
  planName: string;
  investmentName: string;
  tierLabel: string;
  canConfirm: boolean;
  canDelete: boolean;
  canCancel: boolean;
};

export type AdminInvestmentOrdersData = {
  summary: {
    totalOrders: number;
    pendingOrders: number;
    confirmedOrders: number;
    totalVolume: number;
  };
  orders: AdminInvestmentOrderListItem[];
};

export async function getAdminInvestmentOrders(): Promise<AdminInvestmentOrdersData> {
  await assertAdminInvestmentOrderAccess();

  const orders = await prisma.investmentOrder.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      amount: true,
      currency: true,
      status: true,
      investmentModel: true,
      createdAt: true,
      confirmedAt: true,
      paymentReference: true,
      investmentAccount: {
        select: {
          id: true,
          status: true,
        },
      },
      investorProfile: {
        select: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
      investmentPlan: {
        select: {
          name: true,
          investment: {
            select: {
              name: true,
            },
          },
        },
      },
      investmentPlanTier: {
        select: {
          level: true,
        },
      },
    },
  });

  const normalizedOrders = orders.map<AdminInvestmentOrderListItem>((order) => ({
    id: order.id,
    investorName: order.investorProfile.user.name?.trim() || "Unnamed investor",
    investorEmail: order.investorProfile.user.email,
    amount: formatCurrency(order.amount.toNumber(), order.currency),
    amountValue: order.amount.toNumber(),
    currency: order.currency,
    status: order.status,
    statusLabel: formatStatusLabel(order.status),
    modelLabel: formatEnumLabel(order.investmentModel),
    createdAtLabel: formatDateLabel(order.createdAt),
    confirmedAtLabel: formatDateLabel(order.confirmedAt, "Awaiting confirmation"),
    paymentReference:
      order.paymentReference ?? `ORD-${order.id.slice(0, 8).toUpperCase()}`,
    accountName: `Account ${order.investmentAccount.id.slice(0, 8).toUpperCase()} (${formatEnumLabel(order.investmentAccount.status)})`,
    planName: order.investmentPlan.name,
    investmentName: order.investmentPlan.investment.name,
    tierLabel: formatEnumLabel(order.investmentPlanTier.level),
    canConfirm: canConfirmInvestmentOrderStatus(order.status),
    canDelete: order.status === InvestmentOrderStatus.PENDING_PAYMENT,
    canCancel: order.status === InvestmentOrderStatus.PENDING_PAYMENT,
  }));

  return {
    summary: {
      totalOrders: normalizedOrders.length,
      pendingOrders: normalizedOrders.filter((order) => order.canConfirm).length,
      confirmedOrders: normalizedOrders.filter(
        (order) => order.status === InvestmentOrderStatus.CONFIRMED,
      ).length,
      totalVolume: normalizedOrders.reduce(
        (sum, order) => sum + order.amountValue,
        0,
      ),
    },
    orders: normalizedOrders,
  };
}
