import { Prisma } from "@/generated/prisma";

type CleanupDeletedBankInfoRequestStateInput = {
  platformPaymentMethodId: string;
  paymentMethodType: string;
};

type CleanupDeletedBankInfoRequestStateResult = {
  investmentOrderIds: string[];
  savingsAccountIds: string[];
  revalidatePaths: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown, key: string) {
  if (!isRecord(value)) {
    return null;
  }

  return typeof value[key] === "string" ? value[key] : null;
}

export async function cleanupDeletedBankInfoRequestState(
  tx: Prisma.TransactionClient,
  {
    platformPaymentMethodId,
    paymentMethodType,
  }: CleanupDeletedBankInfoRequestStateInput,
): Promise<CleanupDeletedBankInfoRequestStateResult> {
  let investmentOrderIds: string[] = [];
  let savingsAccountIds: string[] = [];

  if (paymentMethodType === "BANK_INFO") {
    const investmentOrders = await tx.investmentOrder.findMany({
      where: {
        platformPaymentMethodId,
      },
      select: {
        id: true,
        investorProfile: {
          select: {
            user: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    const savingsAccounts = await tx.savingsAccount.findMany({
      where: {
        platformPaymentMethodId,
      },
      select: {
        id: true,
        investorProfile: {
          select: {
            user: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    const savingsRequests = await tx.notification.findMany({
      where: {
        key: {
          startsWith: "savings-funding-bank-info-request-ack:",
        },
      },
      select: {
        id: true,
        key: true,
        metadata: true,
      },
    });

    const savingsRequestsToDelete = savingsRequests.flatMap((notification) => {
      const metadata = getString(
        notification.metadata,
        "platformPaymentMethodId",
      );
      const savingsAccountId = getString(
        notification.metadata,
        "savingsAccountId",
      );
      const requesterId = getString(notification.metadata, "requesterId");

      if (
        metadata !== platformPaymentMethodId ||
        !savingsAccountId ||
        !requesterId
      ) {
        return [];
      }

      return [
        {
          savingsAccountId,
          requesterId,
        },
      ];
    });

    investmentOrderIds = investmentOrders.map((order) => order.id);
    savingsAccountIds = Array.from(
      new Set(
        [
          ...savingsAccounts.map((account) => account.id),
          ...savingsRequestsToDelete.map((request) => request.savingsAccountId),
        ],
      ),
    );

    for (const order of investmentOrders) {
      const orderId = order.id;
      const requesterId = order.investorProfile.user.id;

      await tx.notification.deleteMany({
        where: {
          OR: [
            {
              key: {
                startsWith: `investment-order-bank-info-request:${orderId}:`,
              },
            },
            {
              key: {
                startsWith: `investment-order-bank-info-request-ack:${orderId}:${requesterId}`,
              },
            },
            {
              key: `investment-order-bank-info-ready:${orderId}`,
            },
          ],
        },
      });
    }

    for (const account of savingsAccounts) {
      const requesterId = account.investorProfile.user.id;

      await tx.notification.deleteMany({
        where: {
          OR: [
            {
              key: {
                startsWith: `savings-funding-bank-info-request:${account.id}:`,
              },
            },
            {
              key: {
                startsWith: `savings-funding-bank-info-request-ack:${account.id}:${requesterId}`,
              },
            },
          ],
        },
      });
    }

    for (const request of savingsRequestsToDelete) {
      await tx.notification.deleteMany({
        where: {
          OR: [
            {
              key: {
                startsWith: `savings-funding-bank-info-request:${request.savingsAccountId}:`,
              },
            },
            {
              key: {
                startsWith: `savings-funding-bank-info-request-ack:${request.savingsAccountId}:${request.requesterId}`,
              },
            },
          ],
        },
      });
    }
  }

  const pendingWithdrawalProof = await tx.withdrawalOrder.findFirst({
    where: {
      commissionStatus: {
        in: ["PENDING", "PARTIALLY_PAID"],
      },
      AND: [
        {
          payoutSnapshot: {
            path: ["commissionPayment", "reviewStatus"],
            equals: "PENDING_REVIEW",
          },
        },
        {
          payoutSnapshot: {
            path: ["commissionPayment", "platformPaymentMethodId"],
            equals: platformPaymentMethodId,
          },
        },
      ],
    },
    select: {
      id: true,
    },
  });

  if (pendingWithdrawalProof) {
    throw new Error(
      "This payment method cannot be deleted while a withdrawal commission proof is pending review.",
    );
  }

  const revalidatePaths = new Set<string>([
    "/account/dashboard/admin/investment-payments",
    "/account/dashboard/admin/payment-methods",
    "/account/dashboard/notifications",
    "/account/dashboard/checkout",
    "/account/dashboard/super-admin/payment-methods",
  ]);

  for (const orderId of investmentOrderIds) {
    revalidatePaths.add(
      `/account/dashboard/user/investment-orders/${orderId}/payment`,
    );
  }

  return {
    investmentOrderIds,
    savingsAccountIds,
    revalidatePaths: Array.from(revalidatePaths),
  };
}
