import { runDailyAccrual } from "@/lib/jobs/runDailyAccrual";

export async function GET() {
  await runDailyAccrual();

  return Response.json({
    success: true,
    message: "Accrual executed",
  });
}

// import { runDailyAccrual } from "@/lib/jobs/runDailyAccrual";

// export async function GET(req: Request) {
//   const authHeader = req.headers.get("authorization");

//   if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
//     return new Response("Unauthorized", { status: 401 });
//   }

//   await runDailyAccrual();

//   return Response.json({ success: true });
// }
