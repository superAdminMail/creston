import { prisma } from "@/lib/prisma";

const RELEASED_LOCK_DATE = new Date(0);
const LOCK_STALE_AFTER_MS = 15 * 60 * 1000;

export type CronExecutionResult<TResult> = {
  key: string;
  status: "executed" | "skipped";
  reason?: string;
  startedAt: Date;
  finishedAt: Date;
  result?: TResult;
};

export async function withCronLock<TResult>(
  key: string,
  runner: () => Promise<TResult>,
): Promise<CronExecutionResult<TResult>> {
  const startedAt = new Date();
  const staleBefore = new Date(startedAt.getTime() - LOCK_STALE_AFTER_MS);

  await prisma.cronLock.createMany({
    data: [
      {
        name: key,
        lockedAt: RELEASED_LOCK_DATE,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.cronJob.upsert({
    where: {
      key,
    },
    create: {
      key,
      isRunning: false,
      lastRunAt: null,
      nextRunAt: null,
    },
    update: {},
  });

  const lockResult = await prisma.cronLock.updateMany({
    where: {
      name: key,
      OR: [
        {
          lockedAt: RELEASED_LOCK_DATE,
        },
        {
          lockedAt: {
            lt: staleBefore,
          },
        },
      ],
    },
    data: {
      lockedAt: startedAt,
    },
  });

  if (lockResult.count === 0) {
    const finishedAt = new Date();
    return {
      key,
      status: "skipped",
      reason: "lock-not-acquired",
      startedAt,
      finishedAt,
    };
  }

  await prisma.cronJob.update({
    where: {
      key,
    },
    data: {
      isRunning: true,
    },
  });

  try {
    const result = await runner();
    const finishedAt = new Date();

    await prisma.$transaction([
      prisma.cronJob.update({
        where: {
          key,
        },
        data: {
          isRunning: false,
          lastRunAt: finishedAt,
          nextRunAt: new Date(finishedAt.getTime() + 5 * 60 * 1000),
        },
      }),
      prisma.cronLock.update({
        where: {
          name: key,
        },
        data: {
          lockedAt: RELEASED_LOCK_DATE,
        },
      }),
    ]);

    return {
      key,
      status: "executed",
      startedAt,
      finishedAt,
      result,
    };
  } catch (error) {
    const finishedAt = new Date();

    await prisma.$transaction([
      prisma.cronJob.update({
        where: {
          key,
        },
        data: {
          isRunning: false,
          lastRunAt: finishedAt,
        },
      }),
      prisma.cronLock.update({
        where: {
          name: key,
        },
        data: {
          lockedAt: RELEASED_LOCK_DATE,
        },
      }),
    ]);

    throw error;
  }
}
