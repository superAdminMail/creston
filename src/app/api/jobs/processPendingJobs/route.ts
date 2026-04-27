import { NextResponse } from "next/server";

import { runDailyAccrual } from "@/lib/jobs/runDailyAccrual";
import { runDailyProfitSettlement } from "@/lib/jobs/runDailyProfitSettlement";

function isVercelCron(request: Request) {
  return request.headers.get("x-vercel-cron") === "1";
}

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (isVercelCron(request)) {
    return true;
  }

  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }

  return request.headers.get("authorization") === `Bearer ${secret}`;
}

async function runJobs() {
  const [accrual, settlement] = await Promise.allSettled([
    runDailyAccrual(),
    runDailyProfitSettlement(),
  ]);

  return {
    accrual,
    settlement,
  };
}

function formatSettledJob<TResult>(
  settledResult: PromiseFulfilledResult<TResult> | PromiseRejectedResult,
) {
  if (settledResult.status === "fulfilled") {
    return {
      status: "fulfilled" as const,
      value: settledResult.value,
    };
  }

  return {
    status: "rejected" as const,
    reason:
      settledResult.reason instanceof Error
        ? settledResult.reason.message
        : String(settledResult.reason),
  };
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jobs = await runJobs();
  const formattedJobs = {
    accrual: formatSettledJob(jobs.accrual),
    settlement: formatSettledJob(jobs.settlement),
  };
  const failures = Object.entries(formattedJobs)
    .filter(([, job]) => job.status === "rejected")
    .map(([name, job]) => ({
      name,
      reason: job.status === "rejected" ? job.reason : undefined,
    }));

  return NextResponse.json({
    status: failures.length > 0 ? "partial_failure" : "ok",
    jobs: formattedJobs,
    failures,
  });
}
