import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET single account
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const acc = await db.account.findUnique({ where: { id } });
    if (!acc) return NextResponse.json({ success: false, error: "Account not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: acc });
  } catch (err) {
    console.error("GET /api/accounts/[id] error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch account" }, { status: 500 });
  }
}

// PUT update account
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const existing = await db.account.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, error: "Account not found" }, { status: 404 });

    const updated = await db.account.update({
      where: { id },
      data: {
        name: body.name !== undefined ? (body.name as string).trim() : existing.name,
        currency: body.currency ? String(body.currency).toUpperCase() : existing.currency,
        type: body.type || existing.type,
        initialBalance: body.initialBalance !== undefined ? Number(body.initialBalance) : existing.initialBalance,
        notes: body.notes !== undefined ? (body.notes ? String(body.notes).trim() : null) : existing.notes,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("PUT /api/accounts/[id] error:", err);
    return NextResponse.json({ success: false, error: "Failed to update account" }, { status: 500 });
  }
}

// DELETE (archive) account
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing = await db.account.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, error: "Account not found" }, { status: 404 });

    // Archive instead of hard delete
    await db.account.update({
      where: { id },
      data: { archivedAt: new Date() },
    });

    return NextResponse.json({ success: true, message: "Account archived" });
  } catch (err) {
    console.error("DELETE /api/accounts/[id] error:", err);
    return NextResponse.json({ success: false, error: "Failed to archive account" }, { status: 500 });
  }
}
