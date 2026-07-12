import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  TransactionInput,
  validateTransactionInput,
  INCOME_CATEGORIES,
  CURRENCY_MAP,
} from "@/lib/constants";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const tx = await db.transaction.findUnique({
      where: { id },
      include: { account: true, contact: true },
    });
    if (!tx) return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: tx });
  } catch (err) {
    console.error("GET /api/transactions/[id] error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const existing = await db.transaction.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 });

    const currency = body.currency ? String(body.currency).toUpperCase() : existing.currency;
    const amountOriginal = body.amountOriginal !== undefined ? Number(body.amountOriginal) : existing.amountOriginal;
    const exchangeRate = body.exchangeRate !== undefined
      ? Number(body.exchangeRate)
      : existing.exchangeRate;
    const amountBase = amountOriginal * exchangeRate;

    const input: TransactionInput = {
      type: body.type || existing.type,
      source: (body.source ?? existing.source).toString().trim(),
      category: (body.category ?? existing.category).toString().trim(),
      incomeType: body.incomeType ?? existing.incomeType,
      currency,
      amountOriginal,
      exchangeRate,
      date: body.date || existing.date.toISOString(),
      note: body.note !== undefined ? (body.note ? (body.note as string).trim() : null) : existing.note,
      accountId: body.accountId !== undefined ? (body.accountId || null) : existing.accountId,
      contactId: body.contactId !== undefined ? (body.contactId || null) : existing.contactId,
      invoiceId: body.invoiceId !== undefined ? (body.invoiceId || null) : existing.invoiceId,
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

    const updated = await db.transaction.update({
      where: { id },
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

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("PUT /api/transactions/[id] error:", err);
    return NextResponse.json({ success: false, error: "Failed to update transaction" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing = await db.transaction.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 });

    await db.transaction.update({ where: { id }, data: { deletedAt: new Date() } });
    return NextResponse.json({
      success: true,
      message: "Transaction moved to trash (can be restored within 30 days)",
    });
  } catch (err) {
    console.error("DELETE /api/transactions/[id] error:", err);
    return NextResponse.json({ success: false, error: "Failed to delete transaction" }, { status: 500 });
  }
}
