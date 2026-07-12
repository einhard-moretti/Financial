import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const c = await db.contact.findUnique({ where: { id } });
    if (!c) return NextResponse.json({ success: false, error: "Contact not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: c });
  } catch (err) {
    console.error("GET /api/contacts/[id] error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch contact" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const existing = await db.contact.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, error: "Contact not found" }, { status: 404 });

    const updated = await db.contact.update({
      where: { id },
      data: {
        name: body.name !== undefined ? String(body.name).trim() : existing.name,
        type: body.type || existing.type,
        email: body.email !== undefined ? (body.email ? String(body.email).trim() : null) : existing.email,
        phone: body.phone !== undefined ? (body.phone ? String(body.phone).trim() : null) : existing.phone,
        country: body.country !== undefined ? (body.country ? String(body.country).trim() : null) : existing.country,
        notes: body.notes !== undefined ? (body.notes ? String(body.notes).trim() : null) : existing.notes,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("PUT /api/contacts/[id] error:", err);
    return NextResponse.json({ success: false, error: "Failed to update contact" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing = await db.contact.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, error: "Contact not found" }, { status: 404 });

    await db.contact.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Contact deleted" });
  } catch (err) {
    console.error("DELETE /api/contacts/[id] error:", err);
    return NextResponse.json({ success: false, error: "Failed to delete contact" }, { status: 500 });
  }
}
