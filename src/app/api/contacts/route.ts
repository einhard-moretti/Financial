import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ContactType } from "@/lib/constants";

// GET /api/contacts
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // CLIENT | VENDOR | BOTH
    const search = searchParams.get("search")?.trim();

    const where: Record<string, unknown> = {};
    if (type) {
      if (type === "CLIENT") {
        where.OR = [{ type: "CLIENT" }, { type: "BOTH" }];
      } else if (type === "VENDOR") {
        where.OR = [{ type: "VENDOR" }, { type: "BOTH" }];
      } else {
        where.type = type;
      }
    }
    if (search) {
      where.OR = [
        ...(where.OR || []),
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const contacts = await db.contact.findMany({
      where,
      orderBy: [{ name: "asc" }],
    });

    return NextResponse.json({ success: true, data: contacts });
  } catch (err) {
    console.error("GET /api/contacts error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch contacts" }, { status: 500 });
  }
}

// POST /api/contacts
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = (body.name || "").toString().trim();
    const type = (body.type || "CLIENT").toString() as ContactType;
    const email = body.email ? String(body.email).trim() : null;
    const phone = body.phone ? String(body.phone).trim() : null;
    const country = body.country ? String(body.country).trim() : null;
    const notes = body.notes ? String(body.notes).trim() : null;

    if (!name) {
      return NextResponse.json({ success: false, error: "Contact name is required" }, { status: 400 });
    }
    if (!["CLIENT", "VENDOR", "BOTH"].includes(type)) {
      return NextResponse.json({ success: false, error: "Invalid contact type" }, { status: 400 });
    }

    const created = await db.contact.create({
      data: { name, type, email, phone, country, notes },
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err) {
    console.error("POST /api/contacts error:", err);
    return NextResponse.json({ success: false, error: "Failed to create contact" }, { status: 500 });
  }
}
