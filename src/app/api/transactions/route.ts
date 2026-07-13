import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  TransactionInput,
  validateTransactionInput,
  INCOME_CATEGORIES,
  CURRENCY_MAP,
} from "@/lib/constants";

// GET /api/transactions
// Query: type, monthKey, fromDate, toDate, search, includeDeleted, accountId, contactId, currency
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const monthKey = searchParams.get("monthKey");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");
    const search = searchParams.get("search")?.trim();
    const includeDeleted = searchParams.get("includeDeleted") === "true";
    const accountId = searchParams.get("accountId");
    const contactId = searchParams.get("contactId");
    const currency = searchParams.get("currency");

    const where: Record<string, unknown> = {};
    if (!includeDeleted) where.deletedAt = null;
    else where.deletedAt = { not: null };

    if (type === "INCOME" || type === "EXPENSE") where.type = type;
    if (accountId) where.accountId = accountId;
    if (contactId) where.contactId = contactId;
    if (currency) where.currency = currency;

    if (monthKey) {
      const [year, month] = monthKey.split("-");
      const y = Number(year);
      const m = Number(month);
      if (y && m >= 1 && m <= 12) {
        const start = new Date(y, m - 1, 1);
        const end = new Date(y, m, 1);
        where.date = { gte: start, lt: end };
      }
    } else if (fromDate || toDate) {
      const dateFilter: Record<string, Date> = {};
      if (fromDate) dateFilter.gte = new Date(fromDate);
      if (toDate) {
        const t = new Date(toDate);
        t.setDate(t.getDate() + 1);
        dateFilter.lt = t;
      }
      where.date = dateFilter;
    }

    if (search) {
      where.OR = [
        { source: { contains: search } },
        { category: { contains: search } },
        { note: { contains: search } },
      ];
    }

    const transactions = await db.transaction.findMany({
      where,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      include: {
        account: { select: { id: true, name: true, currency: true } },
        contact: { select: { id: true, name: true, type: true } },
      },
    });

    return NextResponse.json({ success: true, data: transactions });
  } catch (err) {
    console.error("GET /api/transactions error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch transactions" }, { status: 500 });
  }
}

// POST /api/transactions — create (auto-save)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const currency = (body.currency || "IDR").toString().toUpperCase();
    const amountOriginal = Number(body.amountOriginal);
    const exchangeRate = body.exchangeRate
      ? Number(body.exchangeRate)
      : CURRENCY_MAP[currency]?.defaultRateToIDR || 1;
    const amountBase = amountOriginal * exchangeRate;

    const input: TransactionInput = {
      type: body.type,
      source: (body.source || "").toString().trim(),
      category: (body.category || "").toString().trim(),
      incomeType: body.incomeType || null,
      currency,
      amountOriginal,
      exchangeRate,
      date: body.date,
      note: body.note ? (body.note as string).trim() : null,
      accountId: body.accountId || null,
      contactId: body.contactId || null,
      invoiceId: body.invoiceId || null,
    };

    if (input.type === "INCOME" && !input.incomeType) {
      const cat = INCOME_CATEGORIES.find((c) => c.value === input.category);
      if (cat) input.incomeType = cat.incomeType;
    }
    if (input.type === "EXPENSE") input.incomeType = null;

    const errors = validateTransactionInput(input);
    if (errors.length > 0) {
      return NextResponse.json({ success: false, error: errors[0], errors }, { status: 400 });
    }

    let parsedDate: Date;
    try {
      parsedDate = new Date(input.date);
      if (isNaN(parsedDate.getTime())) throw new Error("Invalid date");
    } catch {
      return NextResponse.json({ success: false, error: "Invalid date format" }, { status: 400 });
    }

    const created = await db.transaction.create({
      data: {
        type: input.type,
        source: input.source,
        category: input.category,
        incomeType: input.incomeType ?? null,
        currency: input.currency,
        amountOriginal: input.amountOriginal,
        exchangeRate: input.exchangeRate,
        amountBase,
        date: parsedDate,
        note: input.note,
        accountId: input.accountId,
        contactId: input.contactId,
        invoiceId: input.invoiceId,
      },
      include: {
        account: { select: { id: true, name: true, currency: true } },
        contact: { select: { id: true, name: true, type: true } },
      },
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err) {
    console.error("POST /api/transactions error:", err);
    return NextResponse.json({ success: false, error: "Failed to save transaction" }, { status: 500 });
  }
}
