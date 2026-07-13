import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { formatDate, CURRENCY_MAP } from "@/lib/constants";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const monthKey = searchParams.get("monthKey");

    const where: Record<string, unknown> = { deletedAt: null };
    if (monthKey) {
      const [year, month] = monthKey.split("-");
      const y = Number(year);
      const m = Number(month);
      if (y && m >= 1 && m <= 12) {
        const start = new Date(y, m - 1, 1);
        const end = new Date(y, m, 1);
        where.date = { gte: start, lt: end };
      }
    }

    const transactions = await db.transaction.findMany({
      where,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      include: {
        account: { select: { name: true } },
        contact: { select: { name: true } },
      },
    });

    const headers = [
      "Tanggal",
      "Tipe",
      "Nama Item",
      "Kategori",
      "Income Type",
      "Currency",
      "Jumlah Original",
      "Exchange Rate",
      "Jumlah (IDR)",
      "Account",
      "Partner",
      "Catatan",
      "Dibuat Pada",
    ];

    const escapeCsv = (val: unknown): string => {
      if (val === null || val === undefined) return "";
      const s = String(val);
      if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const rows = transactions.map((tx) =>
      [
        formatDate(tx.date.toISOString(), true),
        tx.type === "INCOME" ? "Pemasukan" : "Pengeluaran",
        tx.source,
        tx.category,
        tx.incomeType || "",
        tx.currency,
        tx.amountOriginal.toString(),
        tx.exchangeRate.toString(),
        tx.amountBase.toString(),
        tx.account?.name || "",
        tx.contact?.name || "",
        tx.note || "",
        formatDate(tx.createdAt.toISOString(), true),
      ]
        .map(escapeCsv)
        .join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");

    const filename = monthKey
      ? `einhard-financial-${monthKey}.csv`
      : `einhard-financial-all-${new Date().toISOString().split("T")[0]}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("GET /api/export error:", err);
    return NextResponse.json({ success: false, error: "Failed to export CSV" }, { status: 500 });
  }
}

// Reference to keep CURRENCY_MAP import valid (unused otherwise in this file)
void CURRENCY_MAP;
