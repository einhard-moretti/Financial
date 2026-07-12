/**
 * Database seed script.
 * Populates the database with sample accounts, contacts, transactions, and invoices
 * for local development and demo purposes.
 *
 * Usage: bun run scripts/seed.ts
 */

const BASE_URL = "http://localhost:3000/api";

async function post(path: string, body: unknown) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(`POST ${path} failed: ${data.error}`);
  }
  return data.data;
}

async function seedAccounts() {
  console.log("Seeding accounts...");

  const accounts = {
    bankBusiness: await post("/accounts", {
      name: "BCA",
      currency: "IDR",
      type: "BANK",
      initialBalance: 500000000,
    }),
    wiseUsd: await post("/accounts", {
      name: "Wise",
      currency: "USD",
      type: "EWALLET",
      initialBalance: 25000,
    }),
    bankPersonal: await post("/accounts", {
      name: "Mandiri",
      currency: "IDR",
      type: "BANK",
      initialBalance: 150000000,
    }),
    cash: await post("/accounts", {
      name: "Cash",
      currency: "IDR",
      type: "CASH",
      initialBalance: 5000000,
    }),
    crypto: await post("/accounts", {
      name: "Binance",
      currency: "USD",
      type: "CRYPTO",
      initialBalance: 5000,
    }),
  };

  console.log(`Created ${Object.keys(accounts).length} accounts.`);
  return accounts;
}

async function seedContacts() {
  console.log("Seeding contacts...");

  const contacts = {
    client1: await post("/contacts", {
      name: "Nusantara Digital Co.",
      type: "CLIENT",
      email: "finance@nusantaradigital.id",
      country: "ID",
      notes: "Client since 2023",
    }),
    client2: await post("/contacts", {
      name: "Acme Corp",
      type: "CLIENT",
      email: "billing@acme.com",
      country: "US",
    }),
    vendor1: await post("/contacts", {
      name: "AWS Singapore",
      type: "VENDOR",
      email: "billing@aws.com",
      country: "SG",
    }),
    vendor2: await post("/contacts", {
      name: "Sumber Rezeki Payroll Services",
      type: "VENDOR",
      country: "ID",
      phone: "+62 21 555 1234",
    }),
  };

  console.log(`Created ${Object.keys(contacts).length} contacts.`);
  return contacts;
}

async function seedTransactions(
  accounts: Awaited<ReturnType<typeof seedAccounts>>,
  contacts: Awaited<ReturnType<typeof seedContacts>>
) {
  console.log("Seeding transactions...");

  const transactions = [
    {
      type: "INCOME",
      source: "Website Project — Nusantara Digital",
      category: "Core Business",
      currency: "IDR",
      amountOriginal: 150000000,
      exchangeRate: 1,
      date: "2026-06-05T10:00",
      accountId: accounts.bankBusiness.id,
      contactId: contacts.client1.id,
      note: "Milestone payment 2 — website revamp project",
    },
    {
      type: "INCOME",
      source: "SaaS Subscription Q2 — Acme",
      category: "Recurring Revenue",
      currency: "USD",
      amountOriginal: 12000,
      exchangeRate: 16200,
      date: "2026-06-08T09:00",
      accountId: accounts.wiseUsd.id,
      contactId: contacts.client2.id,
      note: "Recurring annual subscription for 50 seats",
    },
    {
      type: "INCOME",
      source: "BBCA Stock Dividend Q2",
      category: "Stock Dividends",
      currency: "IDR",
      amountOriginal: 25000000,
      exchangeRate: 1,
      date: "2026-06-12T14:00",
      accountId: accounts.bankPersonal.id,
      note: "Q2 2026 dividend payout",
    },
    {
      type: "INCOME",
      source: "Sudirman Apartment Rental",
      category: "Property Rental",
      currency: "IDR",
      amountOriginal: 18000000,
      exchangeRate: 1,
      date: "2026-06-01T08:00",
      accountId: accounts.bankBusiness.id,
      note: "June 2026 monthly rent",
    },
    {
      type: "EXPENSE",
      source: "AWS Cloud Hosting — June",
      category: "Business Operations",
      currency: "USD",
      amountOriginal: 2400,
      exchangeRate: 16200,
      date: "2026-06-03T00:00",
      accountId: accounts.wiseUsd.id,
      contactId: contacts.vendor1.id,
      note: "EC2 + S3 + RDS for production",
    },
    {
      type: "EXPENSE",
      source: "Employee Payroll — Monthly",
      category: "Payroll",
      currency: "IDR",
      amountOriginal: 45000000,
      exchangeRate: 1,
      date: "2026-06-25T09:00",
      accountId: accounts.bankBusiness.id,
      contactId: contacts.vendor2.id,
      note: "5 staff salaries — June 2026",
    },
    {
      type: "EXPENSE",
      source: "Coworking Office Rent",
      category: "Office Rent",
      currency: "IDR",
      amountOriginal: 12000000,
      exchangeRate: 1,
      date: "2026-06-01T08:00",
      accountId: accounts.bankBusiness.id,
    },
    {
      type: "EXPENSE",
      source: "Family Vacation — Bali 4D3N",
      category: "Travel",
      currency: "IDR",
      amountOriginal: 35000000,
      exchangeRate: 1,
      date: "2026-06-15T12:00",
      accountId: accounts.bankPersonal.id,
      note: "Villa + flights + activities",
    },
  ];

  for (const tx of transactions) {
    await post("/transactions", tx);
  }

  console.log(`Created ${transactions.length} transactions.`);
}

async function seedInvoices(
  accounts: Awaited<ReturnType<typeof seedAccounts>>,
  contacts: Awaited<ReturnType<typeof seedContacts>>
) {
  console.log("Seeding invoices...");

  await post("/invoices", {
    title: "Consulting Services Q3 — Acme Corp",
    currency: "USD",
    amountOriginal: 25000,
    exchangeRate: 16200,
    issueDate: "2026-06-01",
    dueDate: "2026-07-01",
    contactId: contacts.client2.id,
    accountId: accounts.wiseUsd.id,
    notes: "50% upfront, 50% on completion",
  });

  await post("/invoices", {
    title: "SaaS License Renewal — Nusantara Digital",
    currency: "IDR",
    amountOriginal: 75000000,
    exchangeRate: 1,
    issueDate: "2026-05-01",
    dueDate: "2026-05-15",
    contactId: contacts.client1.id,
    accountId: accounts.bankBusiness.id,
  });

  const res = await fetch(`${BASE_URL}/invoices`);
  const { data: invoices } = await res.json();

  for (const invoice of invoices) {
    if (invoice.status === "DRAFT") {
      await fetch(`${BASE_URL}/invoices/${invoice.id}/send`, { method: "POST" });
      console.log(`  Invoice ${invoice.number} marked as SENT.`);
    }
  }

  console.log("Invoice seeding complete.");
}

async function seed() {
  const accounts = await seedAccounts();
  const contacts = await seedContacts();
  await seedTransactions(accounts, contacts);
  await seedInvoices(accounts, contacts);

  console.log("\nSeed complete.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});