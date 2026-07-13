import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { AccountType, CURRENCY_MAP } from "@/lib/constants";

// GET /api/accounts — list all (with computed balances)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeArchived = searchParams.get("includeArchived") === "true";

    const where: Record<string, unknown> = {};
    if (!includeArchived) {
      where.archivedAt = null;
    }

    const accounts = await db.account.findMany({
      where,
      orderBy: [{ createdAt: "asc" }],
      include: {
        transactions: {
          where: { deletedAt: null },
          select: { type: true, amountBase: true },
        },
      },
    });

    // Compute current balance for each account
    const withBalances = accounts.map((acc) => {
      let delta = 0;
      for (const tx of acc.transactions) {
        if (tx.type === "INCOME") delta += tx.amountBase;
        else delta -= tx.amountBase;
      }
      const currentBalanceBase = acc.initialBalance + delta;
      // Convert to account's native currency (approximately, using inverse rate from latest)
      const currentBalance =
        acc.currency === "IDR"
          ? currentBalanceBase
          : currentBalanceBase / (CURRENCY_MAP[acc.currency]?.defaultRateToIDR || 1);
      return {
        ...acc,
        transactions: undefined, // remove the nested transactions from response
        currentBalance,
        currentBalanceBase,
      };
    });

    return NextResponse.json({ success: true, data: withBalances });
  } catch (err) {
    console.error("GET /api/accounts error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch accounts" }, { status: 500 });
  }
}

// POST /api/accounts — create new account
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = (body.name || "").toString().trim();
    const currency = (body.currency || "IDR").toString().toUpperCase();
    const type = (body.type || "BANK").toString() as AccountType;
    const initialBalance = Number(body.initialBalance) || 0;
    const notes = body.notes ? (body.notes as string).trim() : null;

    if (!name) {
      return NextResponse.json({ success: false, error: "Account name is required" }, { status: 400 });
    }
    if (!CURRENCY_MAP[currency]) {
      return NextResponse.json({ success: false, error: "Invalid currency" }, { status: 400 });
    }
    if (!["BANK", "EWALLET", "CASH", "CRYPTO", "INVESTMENT"].includes(type)) {
      return NextResponse.json({ success: false, error: "Invalid account type" }, { status: 400 });
    }

    const created = await db.account.create({
      data: {
        name,
        currency,
        type,
        initialBalance,
        notes,
      },
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err) {
    console.error("POST /api/accounts error:", err);
    return NextResponse.json({ success: false, error: "Failed to create account" }, { status: 500 });
  }
}
