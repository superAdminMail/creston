import { prisma } from "@/lib/prisma";

const RELEASED_LOCK_DATE = new Date(0);
const LOCK_STALE_AFTER_MS = 15 * 60 * 1000;
const DEFAULT_CRON_MAX_ATTEMPTS = 5;
const DEFAULT_CRON_INITIAL_RETRY_DELAY_MS = 1_000;
const DEFAULT_CRON_MAX_RETRY_DELAY_MS = 5_000;
const DEFAULT_CRON_RETRY_BACKOFF_MULTIPLIER = 2;

export type CronExecutionResult<TResult> = {
  key: string;
  status: "executed" | "skipped";
  reason?: string;
  startedAt: Date;
  finishedAt: Date;
  attempts: number;
  retriesUsed: number;
  result?: TResult;
};

export type CronRetryOptions = {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
};

type CronFinalizationState = {
  finishedAt: Date;
  succeeded: boolean;
};

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

async function runWithRetry<TResult>(
  label: string,
  runner: () => Promise<TResult>,
  options: CronRetryOptions = {},
): Promise<{ result: TResult; attempts: number; retriesUsed: number }> {
  const maxAttempts = Math.max(
    1,
    options.maxAttempts ?? DEFAULT_CRON_MAX_ATTEMPTS,
  );
  const initialDelayMs = Math.max(
    0,
    options.initialDelayMs ?? DEFAULT_CRON_INITIAL_RETRY_DELAY_MS,
  );
  const maxDelayMs = Math.max(
    initialDelayMs,
    options.maxDelayMs ?? DEFAULT_CRON_MAX_RETRY_DELAY_MS,
  );
  const backoffMultiplier = Math.max(
    1,
    options.backoffMultiplier ?? DEFAULT_CRON_RETRY_BACKOFF_MULTIPLIER,
  );

  let attempt = 0;
  let delayMs = initialDelayMs;
  let lastError: unknown;

  while (attempt < maxAttempts) {
    attempt += 1;

    try {
      const result = await runner();

      return {
        result,
        attempts: attempt,
        retriesUsed: attempt - 1,
      };
    } catch (error) {
      lastError = error;

      if (attempt >= maxAttempts) {
        throw error;
      }

      console.warn("[cron-retry]", {
        label,
        attempt,
        nextAttempt: attempt + 1,
        maxAttempts,
        delayMs,
        error: getErrorMessage(error),
      });

      await sleep(delayMs);
      delayMs = Math.min(Math.ceil(delayMs * backoffMultiplier), maxDelayMs);
    }
  }

  throw lastError ?? new Error(`Cron runner failed unexpectedly for ${label}`);
}

async function finalizeCronRun(
  key: string,
  finalizationState: CronFinalizationState,
) {
  const nextRunAt = new Date(
    finalizationState.finishedAt.getTime() + 5 * 60 * 1000,
  );

  await runWithRetry(
    `${key}:finalize:${finalizationState.succeeded ? "success" : "failure"}`,
    async () => {
      await prisma.$transaction([
        prisma.cronJob.update({
          where: {
            key,
          },
          data: {
            isRunning: false,
            lastRunAt: finalizationState.finishedAt,
            nextRunAt,
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
    },
    {
      maxAttempts: 3,
      initialDelayMs: 250,
      maxDelayMs: 1_000,
      backoffMultiplier: 2,
    },
  );
}

export async function withCronLock<TResult>(
  key: string,
  runner: () => Promise<TResult>,
  retryOptions: CronRetryOptions = {},
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
      attempts: 0,
      retriesUsed: 0,
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
    const execution = await runWithRetry(key, runner, retryOptions);
    const result = execution.result;
    const finishedAt = new Date();

    await finalizeCronRun(key, {
      finishedAt,
      succeeded: true,
    });

    return {
      key,
      status: "executed",
      startedAt,
      finishedAt,
      attempts: execution.attempts,
      retriesUsed: execution.retriesUsed,
      result,
    };
  } catch (error) {
    const finishedAt = new Date();

    await finalizeCronRun(key, {
      finishedAt,
      succeeded: false,
    });

    throw error;
  }
}
