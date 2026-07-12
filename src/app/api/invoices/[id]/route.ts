import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CURRENCY_MAP } from "@/lib/constants";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const inv = await db.invoice.findUnique({
      where: { id },
      include: { contact: true, account: true },
    });
    if (!inv) return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: inv });
  } catch (err) {
    console.error("GET /api/invoices/[id] error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch invoice" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const existing = await db.invoice.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 });

    const currency = body.currency ? String(body.currency).toUpperCase() : existing.currency;
    const amountOriginal = body.amountOriginal !== undefined ? Number(body.amountOriginal) : existing.amountOriginal;
    const exchangeRate = body.exchangeRate !== undefined
      ? Number(body.exchangeRate)
      : existing.exchangeRate;
    const amountBase = amountOriginal * exchangeRate;

    const updated = await db.invoice.update({
      where: { id },
      data: {
        title: body.title !== undefined ? String(body.title).trim() : existing.title,
        currency,
        amountOriginal,
        exchangeRate,
        amountBase,
        issueDate: body.issueDate ? new Date(body.issueDate) : existing.issueDate,
        dueDate: body.dueDate ? new Date(body.dueDate) : existing.dueDate,
        contactId: body.contactId !== undefined ? (body.contactId || null) : existing.contactId,
        accountId: body.accountId !== undefined ? (body.accountId || null) : existing.accountId,
        notes: body.notes !== undefined ? (body.notes ? String(body.notes).trim() : null) : existing.notes,
        status: body.status || existing.status,
      },
      include: { contact: true, account: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("PUT /api/invoices/[id] error:", err);
    return NextResponse.json({ success: false, error: "Failed to update invoice" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing = await db.invoice.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 });

    // Soft delete
    await db.invoice.update({ where: { id }, data: { deletedAt: new Date() } });
    return NextResponse.json({ success: true, message: "Invoice deleted" });
  } catch (err) {
    console.error("DELETE /api/invoices/[id] error:", err);
    return NextResponse.json({ success: false, error: "Failed to delete invoice" }, { status: 500 });
  }
}
