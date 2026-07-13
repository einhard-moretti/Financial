import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { InvoiceInput, generateInvoiceNumber, getDaysUntil, CURRENCY_MAP } from "@/lib/constants";

// GET /api/invoices
// Query: status, overdue=now (auto-mark overdue), contactId
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const contactId = searchParams.get("contactId");

    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status;
    if (contactId) where.contactId = contactId;

    const invoices = await db.invoice.findMany({
      where,
      orderBy: [{ issueDate: "desc" }, { createdAt: "desc" }],
      include: {
        contact: true,
        account: true,
      },
    });

    // Auto-detect overdue: status SENT or PARTIAL, and dueDate < now
    const now = new Date();
    const enriched = invoices.map((inv) => {
      let effectiveStatus = inv.status;
      if ((inv.status === "SENT" || inv.status === "PARTIAL") && new Date(inv.dueDate) < now) {
        effectiveStatus = "OVERDUE";
      }
      return {
        ...inv,
        status: effectiveStatus,
        daysUntilDue: getDaysUntil(inv.dueDate),
      };
    });

    // Auto-update DB for any newly-overdue invoices
    const overdueIds = invoices
      .filter((inv) => (inv.status === "SENT" || inv.status === "PARTIAL") && new Date(inv.dueDate) < now)
      .map((inv) => inv.id);

    if (overdueIds.length > 0) {
      await db.invoice.updateMany({
        where: { id: { in: overdueIds } },
        data: { status: "OVERDUE" },
      });
    }

    return NextResponse.json({ success: true, data: enriched });
  } catch (err) {
    console.error("GET /api/invoices error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch invoices" }, { status: 500 });
  }
}

// POST /api/invoices
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const title = (body.title || "").toString().trim();
    const currency = (body.currency || "IDR").toString().toUpperCase();
    const amountOriginal = Number(body.amountOriginal);
    const exchangeRate = body.exchangeRate ? Number(body.exchangeRate) : (CURRENCY_MAP[currency]?.defaultRateToIDR || 1);
    const issueDate = body.issueDate;
    const dueDate = body.dueDate;
    const contactId = body.contactId || null;
    const accountId = body.accountId || null;
    const notes = body.notes ? String(body.notes).trim() : null;

    if (!title) {
      return NextResponse.json({ success: false, error: "Invoice title is required" }, { status: 400 });
    }
    if (!amountOriginal || amountOriginal <= 0) {
      return NextResponse.json({ success: false, error: "Invoice amount must be greater than 0" }, { status: 400 });
    }
    if (!issueDate || !dueDate) {
      return NextResponse.json({ success: false, error: "Issue and due dates are required" }, { status: 400 });
    }
    if (new Date(dueDate) < new Date(issueDate)) {
      return NextResponse.json({ success: false, error: "Due date cannot be before issue date" }, { status: 400 });
    }

    // Auto-generate invoice number
    const existing = await db.invoice.findMany({ select: { number: true } });
    const number = generateInvoiceNumber(existing.map((i) => i.number));

    const amountBase = amountOriginal * exchangeRate;

    const created = await db.invoice.create({
      data: {
        number,
        title,
        currency,
        amountOriginal,
        exchangeRate,
        amountBase,
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        contactId,
        accountId,
        notes,
        status: "DRAFT",
      },
      include: { contact: true, account: true },
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err) {
    console.error("POST /api/invoices error:", err);
    return NextResponse.json({ success: false, error: "Failed to create invoice" }, { status: 500 });
  }
}
