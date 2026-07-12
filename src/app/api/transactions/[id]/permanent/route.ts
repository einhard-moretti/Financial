import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// =====================================================
// DELETE /api/transactions/[id]/permanent — Permanent delete (no recovery)
// =====================================================
export async function DELETE(
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

    await db.transaction.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Transaction permanently deleted",
    });
  } catch (err) {
    console.error("DELETE /api/transactions/[id]/permanent error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete permanently" },
      { status: 500 }
    );
  }
}
