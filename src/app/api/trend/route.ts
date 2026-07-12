import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { TrendPoint, getMonthKey, getMonthLabel, getLast12Months } from "@/lib/constants";

export async function GET(_req: NextRequest) {
  try {
    const transactions = await db.transaction.findMany({
      where: { deletedAt: null },
      select: { type: true, amountBase: true, date: true },
    });

    const last12 = getLast12Months();
    const trendMap = new Map<string, TrendPoint>();
    for (const key of last12) {
      trendMap.set(key, {
        month: getMonthLabel(key),
        monthKey: key,
        income: 0,
        expense: 0,
        net: 0,
      });
    }

    for (const tx of transactions) {
      const key = getMonthKey(tx.date);
      const point = trendMap.get(key);
      if (!point) continue;
      if (tx.type === "INCOME") point.income += tx.amountBase;
      else point.expense += tx.amountBase;
    }

    const trend = last12.map((key) => {
      const point = trendMap.get(key)!;
      return { ...point, net: point.income - point.expense };
    });

    return NextResponse.json({ success: true, data: trend });
  } catch (err) {
    console.error("GET /api/trend error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch trend" }, { status: 500 });
  }
}
