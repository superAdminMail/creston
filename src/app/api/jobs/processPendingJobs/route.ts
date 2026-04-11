import { NextResponse } from "next/server";

import { runDailyAccrual } from "@/lib/jobs/runDailyAccrual";
import { runDailyProfitSettlement } from "@/lib/jobs/runDailyProfitSettlement";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }

  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [accrual, settlement] = await Promise.all([
    runDailyAccrual(),
    runDailyProfitSettlement(),
  ]);

  return NextResponse.json({
    status: "ok",
    jobs: {
      accrual,
      settlement,
    },
  });
}
