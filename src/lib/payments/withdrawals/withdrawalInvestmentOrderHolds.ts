import {
  InvestmentOrderStatus,
  Prisma,
  RuntimeStatus,
} from "@/generated/prisma";

import { asJsonObject, toJsonValue } from "@/lib/payments/paymentJson";

const WITHDRAWAL_PAUSE_KEY = "withdrawalPause";

type WithdrawalPauseState = {
  holdIds: string[];
  wasPausedBefore: boolean;
};

type WithdrawalHoldOrderRecord = {
  id: string;
  status: InvestmentOrderStatus;
  runtimeStatus: RuntimeStatus;
  paymentMetadata: unknown;
};

function parseHoldIds(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as string[];
  }

  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function parseWithdrawalPauseState(
  paymentMetadata: unknown,
): WithdrawalPauseState | null {
  const metadata = asJsonObject(paymentMetadata);
  const pause = asJsonObject(metadata[WITHDRAWAL_PAUSE_KEY]);
  const holdIds = parseHoldIds(pause.holdIds);

  if (holdIds.length === 0) {
    return null;
  }

  return {
    holdIds,
    wasPausedBefore: pause.wasPausedBefore === true,
  };
}

function writeWithdrawalPauseState(
  paymentMetadata: unknown,
  state: WithdrawalPauseState | null,
): Prisma.InputJsonValue {
  const metadata = asJsonObject(paymentMetadata);
  const nextMetadata: Record<string, unknown> = {
    ...metadata,
  };

  if (!state || state.holdIds.length === 0) {
    delete nextMetadata[WITHDRAWAL_PAUSE_KEY];
    return toJsonValue(nextMetadata);
  }

  nextMetadata[WITHDRAWAL_PAUSE_KEY] = {
    holdIds: [...new Set(state.holdIds)],
    wasPausedBefore: state.wasPausedBefore === true,
  };

  return toJsonValue(nextMetadata);
}

export function hasWithdrawalPauseHold(paymentMetadata: unknown) {
  return parseWithdrawalPauseState(paymentMetadata) !== null;
}

export function addWithdrawalPauseHold(
  paymentMetadata: unknown,
  withdrawalId: string,
  wasPausedBefore: boolean,
): Prisma.InputJsonValue {
  const state = parseWithdrawalPauseState(paymentMetadata);
  const holdIds = new Set(state?.holdIds ?? []);

  holdIds.add(withdrawalId);

  return writeWithdrawalPauseState(paymentMetadata, {
    holdIds: [...holdIds],
    wasPausedBefore: state?.wasPausedBefore ?? wasPausedBefore,
  });
}

export function removeWithdrawalPauseHold(
  paymentMetadata: unknown,
  withdrawalId: string,
): {
  paymentMetadata: Prisma.InputJsonValue;
  shouldResume: boolean;
} {
  const state = parseWithdrawalPauseState(paymentMetadata);

  if (!state) {
    return {
      paymentMetadata: toJsonValue(asJsonObject(paymentMetadata)),
      shouldResume: false,
    };
  }

  const holdIds = state.holdIds.filter((holdId) => holdId !== withdrawalId);

  if (holdIds.length > 0) {
    return {
      paymentMetadata: writeWithdrawalPauseState(paymentMetadata, {
        holdIds,
        wasPausedBefore: state.wasPausedBefore,
      }),
      shouldResume: false,
    };
  }

  return {
    paymentMetadata: writeWithdrawalPauseState(paymentMetadata, null),
    shouldResume: !state.wasPausedBefore,
  };
}

export function shouldPauseInvestmentOrderForWithdrawal(
  order: Pick<WithdrawalHoldOrderRecord, "status" | "runtimeStatus">,
) {
  return (
    order.status === InvestmentOrderStatus.CONFIRMED &&
    (order.runtimeStatus === RuntimeStatus.ONGOING ||
      order.runtimeStatus === RuntimeStatus.ACTIVE)
  );
}

export async function pauseInvestmentOrdersForWithdrawal(
  tx: Prisma.TransactionClient,
  input: {
    withdrawalId: string;
    orderIds: string[];
  },
) {
  const orderIds = [...new Set(input.orderIds.filter(Boolean))];

  if (orderIds.length === 0) {
    return;
  }

  const orders = await tx.investmentOrder.findMany({
    where: {
      id: {
        in: orderIds,
      },
    },
    select: {
      id: true,
      status: true,
      runtimeStatus: true,
      paymentMetadata: true,
    },
  });

  for (const order of orders) {
    await tx.investmentOrder.update({
      where: {
        id: order.id,
      },
      data: {
        paymentMetadata: addWithdrawalPauseHold(
          order.paymentMetadata,
          input.withdrawalId,
          order.runtimeStatus === RuntimeStatus.PAUSED,
        ),
        ...(shouldPauseInvestmentOrderForWithdrawal(order)
          ? {
              runtimeStatus: RuntimeStatus.PAUSED,
            }
          : {}),
      },
    });
  }
}

export async function releaseInvestmentOrdersForWithdrawal(
  tx: Prisma.TransactionClient,
  withdrawalId: string,
) {
  const withdrawal = await tx.withdrawalOrder.findUnique({
    where: {
      id: withdrawalId,
    },
    select: {
      allocations: {
        select: {
          investmentOrderId: true,
        },
      },
    },
  });

  const orderIds = [
    ...new Set(
      (withdrawal?.allocations ?? [])
        .map((allocation) => allocation.investmentOrderId)
        .filter((investmentOrderId): investmentOrderId is string =>
          Boolean(investmentOrderId),
        ),
    ),
  ];

  if (orderIds.length === 0) {
    return;
  }

  const orders = await tx.investmentOrder.findMany({
    where: {
      id: {
        in: orderIds,
      },
    },
    select: {
      id: true,
      status: true,
      runtimeStatus: true,
      paymentMetadata: true,
    },
  });

  for (const order of orders) {
    const nextHold = removeWithdrawalPauseHold(
      order.paymentMetadata,
      withdrawalId,
    );

    await tx.investmentOrder.update({
      where: {
        id: order.id,
      },
      data: {
        paymentMetadata: nextHold.paymentMetadata,
        ...(nextHold.shouldResume &&
        order.status === InvestmentOrderStatus.CONFIRMED &&
        order.runtimeStatus === RuntimeStatus.PAUSED
          ? {
              runtimeStatus: RuntimeStatus.ONGOING,
            }
          : {}),
      },
    });
  }
}
