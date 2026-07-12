import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// =====================================================
// POST /api/invoices/[id]/mark-paid
// Marks invoice as PAID and auto-creates an INCOME transaction linked to it
// =====================================================
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const invoice = await db.invoice.findUnique({
      where: { id },
      include: { contact: true, account: true },
    });
    if (!invoice) {
      return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 });
    }
    if (invoice.status === "PAID") {
      return NextResponse.json({ success: false, error: "Invoice is already marked as PAID" }, { status: 400 });
    }

    // Optional: allow partial payment via body.paidAmount
    const now = new Date();
    const paidDate = body.paidDate ? new Date(body.paidDate) : now;
    const receivedAmount = body.receivedAmount // optional: actual received amount in invoice currency
      ? Number(body.receivedAmount)
      : invoice.amountOriginal;
    const receivedExchangeRate = body.receivedExchangeRate
      ? Number(body.receivedExchangeRate)
      : invoice.exchangeRate;
    const receivedAmountBase = receivedAmount * receivedExchangeRate;

    // Create a linked INCOME transaction
    const transaction = await db.transaction.create({
      data: {
        type: "INCOME",
        source: `Invoice ${invoice.number} — ${invoice.title}`,
        category: "Bisnis Utama", // default; user can edit later
        incomeType: "AKTIF",
        currency: invoice.currency,
        amountOriginal: receivedAmount,
        exchangeRate: receivedExchangeRate,
        amountBase: receivedAmountBase,
        date: paidDate,
        note: `Pembayaran untuk invoice ${invoice.number}${invoice.contact ? ` dari ${invoice.contact.name}` : ""}`,
        accountId: invoice.accountId,
        contactId: invoice.contactId,
        invoiceId: invoice.id,
      },
    });

    // Update invoice status
    const isPartialPayment = receivedAmountBase < invoice.amountBase - 1; // tolerance 1 IDR
    const updatedInvoice = await db.invoice.update({
      where: { id },
      data: {
        status: isPartialPayment ? "PARTIAL" : "PAID",
        paidAmountBase: invoice.paidAmountBase + receivedAmountBase,
        transactionId: transaction.id,
      },
      include: { contact: true, account: true },
    });

    return NextResponse.json({
      success: true,
      data: { invoice: updatedInvoice, transaction },
      message: isPartialPayment ? "Partial payment recorded" : "Invoice paid, income transaction auto-created",
    });
  } catch (err) {
    console.error("POST /api/invoices/[id]/mark-paid error:", err);
    return NextResponse.json({ success: false, error: "Failed to mark invoice as paid" }, { status: 500 });
  }
}
