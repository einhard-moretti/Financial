import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Summary } from "@/lib/constants";

// GET /api/summary?monthKey=2026-06
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const monthKey = searchParams.get("monthKey");

    const where: Record<string, unknown> = { deletedAt: null };
    if (monthKey) {
      const [year, month] = monthKey.split("-");
      const y = Number(year);
      const m = Number(month);
      if (y && m >= 1 && m <= 12) {
        const start = new Date(y, m - 1, 1);
        const end = new Date(y, m, 1);
        where.date = { gte: start, lt: end };
      }
    }

    const transactions = await db.transaction.findMany({
      where,
      select: {
        type: true,
        source: true,
        category: true,
        incomeType: true,
        amountBase: true,
        currency: true,
        accountId: true,
      },
    });

    let totalIncome = 0;
    let totalExpense = 0;
    let totalPassive = 0;
    let totalActive = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    const incomeBySource = new Map<string, number>();
    const expenseByCategory = new Map<string, number>();
    const byCurrencyMap = new Map<string, { income: number; expense: number }>();

    for (const tx of transactions) {
      const curEntry = byCurrencyMap.get(tx.currency) || { income: 0, expense: 0 };
      if (tx.type === "INCOME") {
        totalIncome += tx.amountBase;
        incomeCount++;
        curEntry.income += tx.amountBase;
        if (tx.incomeType === "PASIF") totalPassive += tx.amountBase;
        else if (tx.incomeType === "AKTIF") totalActive += tx.amountBase;
        incomeBySource.set(tx.source, (incomeBySource.get(tx.source) || 0) + tx.amountBase);
      } else {
        totalExpense += tx.amountBase;
        expenseCount++;
        curEntry.expense += tx.amountBase;
        expenseByCategory.set(tx.category, (expenseByCategory.get(tx.category) || 0) + tx.amountBase);
      }
      byCurrencyMap.set(tx.currency, curEntry);
    }

    const netCashFlow = totalIncome - totalExpense;
    const passivePercentage = totalIncome > 0 ? (totalPassive / totalIncome) * 100 : 0;

    let topIncomeSource: { source: string; amount: number } | null = null;
    for (const [source, amount] of incomeBySource) {
      if (!topIncomeSource || amount > topIncomeSource.amount) {
        topIncomeSource = { source, amount };
      }
    }

    let topExpenseCategory: { category: string; amount: number } | null = null;
    for (const [category, amount] of expenseByCategory) {
      if (!topExpenseCategory || amount > topExpenseCategory.amount) {
        topExpenseCategory = { category, amount };
      }
    }

    // Compute account balances (all-time, not month-filtered)
    const accounts = await db.account.findMany({
      where: { archivedAt: null },
      include: {
        transactions: {
          where: { deletedAt: null },
          select: { type: true, amountBase: true },
        },
      },
    });

    const byAccount = accounts.map((acc) => {
      let delta = 0;
      for (const tx of acc.transactions) {
        if (tx.type === "INCOME") delta += tx.amountBase;
        else delta -= tx.amountBase;
      }
      return {
        accountId: acc.id,
        accountName: acc.name,
        currency: acc.currency,
        balance: acc.initialBalance + delta,
      };
    });

    const byCurrency = Array.from(byCurrencyMap.entries()).map(([currency, v]) => ({
      currency,
      income: v.income,
      expense: v.expense,
    }));

    const summary: Summary = {
      totalIncome,
      totalExpense,
      netCashFlow,
      totalPassive,
      totalActive,
      passivePercentage,
      incomeCount,
      expenseCount,
      topIncomeSource,
      topExpenseCategory,
      byCurrency,
      byAccount,
    };

    return NextResponse.json({ success: true, data: summary });
  } catch (err) {
    console.error("GET /api/summary error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch summary" }, { status: 500 });
  }
}
