// Seed script: create initial accounts, contacts, and transactions
const BASE = "http://localhost:3000/api";

async function post(path: string, body: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.success) throw new Error(`POST ${path} failed: ${data.error}`);
  return data.data;
}

async function seed() {
  console.log("🌱 Seeding accounts...");
  const bcaBisnis = await post("/accounts", { name: "BCA Bisnis", currency: "IDR", type: "BANK", initialBalance: 500000000 });
  const wiseUsd = await post("/accounts", { name: "Wise USD", currency: "USD", type: "EWALLET", initialBalance: 25000 });
  const mandiri = await post("/accounts", { name: "Mandiri Personal", currency: "IDR", type: "BANK", initialBalance: 150000000 });
  const cash = await post("/accounts", { name: "Cash Kantor", currency: "IDR", type: "CASH", initialBalance: 5000000 });
  const crypto = await post("/accounts", { name: "Binance BTC", currency: "USD", type: "CRYPTO", initialBalance: 5000 });
  console.log(`  ✓ ${bcaBisnis.name}, ${wiseUsd.name}, ${mandiri.name}, ${cash.name}, ${crypto.name}`);

  console.log("🌱 Seeding contacts...");
  const client1 = await post("/contacts", { name: "PT Maju Mundur (ID)", type: "CLIENT", email: "finance@majumundur.id", country: "ID", notes: "Client sejak 2023" });
  const client2 = await post("/contacts", { name: "Acme Corp (US)", type: "CLIENT", email: "billing@acme.com", country: "US" });
  const vendor1 = await post("/contacts", { name: "AWS Singapore", type: "VENDOR", email: "billing@aws.com", country: "SG" });
  const vendor2 = await post("/contacts", { name: "PT Sumber Rezeki", type: "VENDOR", country: "ID", phone: "+62 21 555 1234" });
  console.log(`  ✓ ${client1.name}, ${client2.name}, ${vendor1.name}, ${vendor2.name}`);

  console.log("🌱 Seeding transactions...");
  await post("/transactions", {
    type: "INCOME", source: "Project Website PT Maju Mundur", category: "Bisnis Utama",
    currency: "IDR", amountOriginal: 150000000, exchangeRate: 1,
    date: "2026-06-05T10:00",
    accountId: bcaBisnis.id, contactId: client1.id,
    note: "Pembayaran termin 2 project website revamp"
  });
  await post("/transactions", {
    type: "INCOME", source: "SaaS Subscription Q2 — Acme", category: "Bisnis Otomatis",
    currency: "USD", amountOriginal: 12000, exchangeRate: 16200,
    date: "2026-06-08T09:00",
    accountId: wiseUsd.id, contactId: client2.id,
    note: "Recurring annual subscription for 50 seats"
  });
  await post("/transactions", {
    type: "INCOME", source: "Dividen Saham BBCA Q2", category: "Dividen Saham",
    currency: "IDR", amountOriginal: 25000000, exchangeRate: 1,
    date: "2026-06-12T14:00",
    accountId: mandiri.id,
    note: "Dividen kuartal Q2 2026"
  });
  await post("/transactions", {
    type: "INCOME", source: "Sewa Apartemen Sudirman", category: "Sewa Properti",
    currency: "IDR", amountOriginal: 18000000, exchangeRate: 1,
    date: "2026-06-01T08:00",
    accountId: bcaBisnis.id,
    note: "Sewa bulanan Juni 2026"
  });
  await post("/transactions", {
    type: "EXPENSE", source: "AWS Cloud Hosting June", category: "Operasional Bisnis",
    currency: "USD", amountOriginal: 2400, exchangeRate: 16200,
    date: "2026-06-03T00:00",
    accountId: wiseUsd.id, contactId: vendor1.id,
    note: "EC2 + S3 + RDS for production"
  });
  await post("/transactions", {
    type: "EXPENSE", source: "Gaji Karyawan — Bulanan", category: "Gaji Karyawan",
    currency: "IDR", amountOriginal: 45000000, exchangeRate: 1,
    date: "2026-06-25T09:00",
    accountId: bcaBisnis.id, contactId: vendor2.id,
    note: "Gaji 5 staff juni 2026"
  });
  await post("/transactions", {
    type: "EXPENSE", source: "Sewa Kantor Coworking", category: "Sewa Kantor",
    currency: "IDR", amountOriginal: 12000000, exchangeRate: 1,
    date: "2026-06-01T08:00",
    accountId: bcaBisnis.id,
  });
  await post("/transactions", {
    type: "EXPENSE", source: "Liburan Family Bali 4D3N", category: "Travel",
    currency: "IDR", amountOriginal: 35000000, exchangeRate: 1,
    date: "2026-06-15T12:00",
    accountId: mandiri.id,
    note: "Villa + flights + activities"
  });

  console.log("🌱 Seeding invoices...");
  await post("/invoices", {
    title: "Consulting Services Q3 — Acme Corp",
    currency: "USD", amountOriginal: 25000, exchangeRate: 16200,
    issueDate: "2026-06-01", dueDate: "2026-07-01",
    contactId: client2.id, accountId: wiseUsd.id,
    notes: "50% upfront, 50% on completion"
  });
  await post("/invoices", {
    title: "SaaS License Renewal — PT Maju Mundur",
    currency: "IDR", amountOriginal: 75000000, exchangeRate: 1,
    issueDate: "2026-05-01", dueDate: "2026-05-15",
    contactId: client1.id, accountId: bcaBisnis.id,
  });

  // Convert draft invoices to SENT
  const invRes = await fetch(`${BASE}/invoices`);
  const invData = await invRes.json();
  for (const inv of invData.data) {
    if (inv.status === "DRAFT") {
      await fetch(`${BASE}/invoices/${inv.id}/send`, { method: "POST" });
      console.log(`  ✓ Invoice ${inv.number} → SENT`);
    }
  }

  console.log("\n✅ Seed complete!");
  console.log(`   - 5 accounts (multi-currency: IDR + USD)`);
  console.log(`   - 4 contacts (2 clients + 2 vendors, ID/US/SG)`);
  console.log(`   - 8 transactions (mix IDR + USD)`);
  console.log(`   - 2 invoices (1 pending USD + 1 overdue IDR)`);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
