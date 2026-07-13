import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/invoices/[id]/send
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const invoice = await db.invoice.findUnique({ where: { id } });
    if (!invoice) return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 });
    if (invoice.status !== "DRAFT") {
      return NextResponse.json({ success: false, error: `Invoice sudah berstatus ${invoice.status}` }, { status: 400 });
    }

    const updated = await db.invoice.update({
      where: { id },
      data: { status: "SENT" },
      include: { contact: true, account: true },
    });

    return NextResponse.json({ success: true, data: updated, message: "Invoice marked as sent" });
  } catch (err) {
    console.error("POST /api/invoices/[id]/send error:", err);
    return NextResponse.json({ success: false, error: "Failed to update invoice status" }, { status: 500 });
  }
}
