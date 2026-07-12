import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// =====================================================
// POST /api/transactions/[id]/restore — Restore from trash
// =====================================================
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await db.transaction.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Transaction not found" },
        { status: 404 }
      );
    }
    if (!existing.deletedAt) {
      return NextResponse.json(
        { success: false, error: "This transaction is not in trash" },
        { status: 400 }
      );
    }

    const restored = await db.transaction.update({
      where: { id },
      data: { deletedAt: null },
    });

    return NextResponse.json({
      success: true,
      data: restored,
      message: "Transaction restored successfully",
    });
  } catch (err) {
    console.error("POST /api/transactions/[id]/restore error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to restore transaction" },
      { status: 500 }
    );
  }
}
