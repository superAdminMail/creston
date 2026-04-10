import { runDailyProfitSettlement } from "@/lib/jobs/runDailyProfitSettlement";

export async function GET() {
  await runDailyProfitSettlement();

  return Response.json({
    success: true,
    message: "Daily profit settlement executed",
  });
}
