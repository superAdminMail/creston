// app/api/cron/update-prices/route.ts

import { NextResponse } from "next/server";
import { updateAllPrices } from "@/lib/price/updateAllPrices";

export async function GET() {
  try {
    await updateAllPrices();

    return NextResponse.json({
      success: true,
      message: "Prices updated successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update prices" },
      { status: 500 },
    );
  }
}
