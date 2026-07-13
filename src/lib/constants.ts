
export type TransactionType = "INCOME" | "EXPENSE";
export type IncomeType = "AKTIF" | "PASIF";
export type AccountType = "BANK" | "EWALLET" | "CASH" | "CRYPTO" | "INVESTMENT";
export type ContactType = "CLIENT" | "VENDOR" | "BOTH";
export type InvoiceStatus = "DRAFT" | "SENT" | "PARTIAL" | "PAID" | "OVERDUE" | "CANCELLED";

// CURRENCIES — supported list
export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  defaultRateToIDR: number; // approximate rate for default; user can override
}

export const CURRENCIES: Currency[] = [
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", flag: "🇮🇩", defaultRateToIDR: 1 },
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸", defaultRateToIDR: 16200 },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺", defaultRateToIDR: 17500 },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", flag: "🇸🇬", defaultRateToIDR: 12000 },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧", defaultRateToIDR: 20600 },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵", defaultRateToIDR: 108 },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺", defaultRateToIDR: 10700 },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳", defaultRateToIDR: 2230 },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", flag: "🇲🇾", defaultRateToIDR: 3650 },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", flag: "🇦🇪", defaultRateToIDR: 4410 },
];

export const CURRENCY_MAP: Record<string, Currency> = Object.fromEntries(
  CURRENCIES.map((c) => [c.code, c])
);

export const BASE_CURRENCY = "IDR"; // Everything converted to IDR for summary

// ACCOUNT TYPES

export const ACCOUNT_TYPES: { value: AccountType; label: string; icon: string }[] = [
  { value: "BANK", label: "Bank Account", icon: "🏦" },
  { value: "EWALLET", label: "E-Wallet / Fintech", icon: "📱" },
  { value: "CASH", label: "Cash", icon: "💵" },
  { value: "CRYPTO", label: "Crypto Wallet", icon: "₿" },
  { value: "INVESTMENT", label: "Investment / Brokerage", icon: "📈" },
];

// INVOICE STATUSES

export const INVOICE_STATUSES: {
  value: InvoiceStatus;
  label: string;
  color: string;
  badgeClass: string;
}[] = [
  { value: "DRAFT", label: "Draft", color: "text-muted-foreground", badgeClass: "border-border bg-muted/30 text-muted-foreground" },
  { value: "SENT", label: "Sent", color: "text-sky-400", badgeClass: "border-sky-500/40 bg-sky-500/10 text-sky-400" },
  { value: "PARTIAL", label: "Partial", color: "text-amber-400", badgeClass: "border-amber-400/40 bg-amber-400/10 text-amber-400" },
  { value: "PAID", label: "Paid", color: "text-emerald-400", badgeClass: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" },
  { value: "OVERDUE", label: "Overdue", color: "text-red-400", badgeClass: "border-red-500/40 bg-red-500/10 text-red-400" },
  { value: "CANCELLED", label: "Cancelled", color: "text-muted-foreground", badgeClass: "border-border bg-muted/30 text-muted-foreground line-through" },
];

export const INVOICE_STATUS_MAP: Record<InvoiceStatus, typeof INVOICE_STATUSES[0]> =
  Object.fromEntries(INVOICE_STATUSES.map((s) => [s.value, s])) as Record<InvoiceStatus, typeof INVOICE_STATUSES[0]>;

// CATEGORIES — Pre-defined list

export const INCOME_CATEGORIES: { value: string; label: string; incomeType: IncomeType }[] = [
  { value: "Gaji", label: "Salary / Commission", incomeType: "AKTIF" },
  { value: "Bisnis Utama", label: "Main Business Revenue", incomeType: "AKTIF" },
  { value: "Freelance", label: "Freelance / Consulting", incomeType: "AKTIF" },
  { value: "Bonus", label: "Bonus / Holiday Pay", incomeType: "AKTIF" },
  { value: "Sewa Properti", label: "Property Rental Income", incomeType: "PASIF" },
  { value: "Dividen Saham", label: "Stock Dividends", incomeType: "PASIF" },
  { value: "Bunga Deposito", label: "Deposit Interest", incomeType: "PASIF" },
  { value: "Royalty", label: "Royalties / Licensing", incomeType: "PASIF" },
  { value: "Capital Gain", label: "Capital Gain", incomeType: "PASIF" },
  { value: "Bisnis Otomatis", label: "Automated Business (SaaS, etc.)", incomeType: "PASIF" },
];

export const EXPENSE_CATEGORIES: { value: string; label: string }[] = [
  { value: "Operasional Bisnis", label: "Business Operations" },
  { value: "Gaji Karyawan", label: "Employee Salaries" },
  { value: "Marketing", label: "Marketing & Advertising" },
  { value: "Sewa Kantor", label: "Office / Workspace Rent" },
  { value: "Pajak", label: "Taxes" },
  { value: "Properti", label: "Property Installment / Maintenance" },
  { value: "Kendaraan", label: "Vehicle (Purchase / Installment / Service)" },
  { value: "Travel", label: "Travel & Vacation" },
  { value: "Lifestyle", label: "Lifestyle (Dining, Entertainment, etc.)" },
  { value: "Pendidikan", label: "Education / Self-improvement" },
  { value: "Kesehatan", label: "Health / Insurance" },
  { value: "Reinvestasi", label: "Reinvestment (Stocks, Crypto, etc.)" },
  { value: "Akuisisi Aset", label: "Asset Acquisition (Property, Equipment)" },
];

// TYPES
export interface Account {
  id: string;
  name: string;
  currency: string;
  type: AccountType;
  initialBalance: number;
  notes: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  currentBalance?: number;
  currentBalanceBase?: number;
}

export interface Contact {
  id: string;
  name: string;
  type: ContactType;
  email: string | null;
  phone: string | null;
  country: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  source: string;
  category: string;
  incomeType: IncomeType | null;
  currency: string;
  amountOriginal: number;
  exchangeRate: number;
  amountBase: number;
  date: string;
  note: string | null;
  accountId: string | null;
  account?: Account | null;
  contactId: string | null;
  contact?: Contact | null;
  invoiceId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface TransactionInput {
  type: TransactionType;
  source: string;
  category: string;
  incomeType?: IncomeType | null;
  currency: string;
  amountOriginal: number;
  exchangeRate: number;
  date: string;
  note?: string | null;
  accountId?: string | null;
  contactId?: string | null;
  invoiceId?: string | null;
}

export interface Invoice {
  id: string;
  number: string;
  contactId: string | null;
  contact?: Contact | null;
  accountId: string | null;
  account?: Account | null;
  title: string;
  currency: string;
  amountOriginal: number;
  exchangeRate: number;
  amountBase: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  paidAmountBase: number;
  notes: string | null;
  transactionId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface InvoiceInput {
  number?: string;
  contactId?: string | null;
  accountId?: string | null;
  title: string;
  currency: string;
  amountOriginal: number;
  exchangeRate: number;
  issueDate: string;
  dueDate: string;
  notes?: string | null;
}

export interface Summary {
  totalIncome: number;
  totalExpense: number;
  netCashFlow: number;
  totalPassive: number;
  totalActive: number;
  passivePercentage: number;
  incomeCount: number;
  expenseCount: number;
  topIncomeSource: { source: string; amount: number } | null;
  topExpenseCategory: { category: string; amount: number } | null;
  byCurrency: { currency: string; income: number; expense: number }[];
  byAccount: { accountId: string; accountName: string; currency: string; balance: number }[];
}

export interface TrendPoint {
  month: string;
  monthKey: string;
  income: number;
  expense: number;
  net: number;
}

// FORMATTERS

export function formatCurrency(amount: number, currency: string = "IDR", opts?: { compact?: boolean; sign?: boolean }): string {
  const cur = CURRENCY_MAP[currency] || CURRENCY_MAP.IDR;
  const sign = opts?.sign && amount > 0 ? "+" : amount < 0 ? "−" : "";
  const abs = Math.abs(amount);

  if (opts?.compact) {
    if (currency === "IDR") {
      if (abs >= 1_000_000_000) return `${sign}Rp ${(abs / 1_000_000_000).toFixed(2)}M`;
      if (abs >= 1_000_000) return `${sign}Rp ${(abs / 1_000_000).toFixed(2)}jt`;
      if (abs >= 1_000) return `${sign}Rp ${(abs / 1_000).toFixed(1)}rb`;
      return `${sign}Rp ${abs.toLocaleString("id-ID")}`;
    }
    // For non-IDR
    if (abs >= 1_000_000) return `${sign}${cur.symbol}${(abs / 1_000_000).toFixed(2)}M`;
    if (abs >= 1_000) return `${sign}${cur.symbol}${(abs / 1_000).toFixed(1)}K`;
    return `${sign}${cur.symbol}${abs.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  }

  if (currency === "IDR") {
    return `${sign}Rp ${abs.toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;
  }
  return `${sign}${cur.symbol}${abs.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

// Backward-compatible alias
export function formatIDR(value: number, opts?: { compact?: boolean; sign?: boolean }): string {
  return formatCurrency(value, "IDR", opts);
}

export function formatDate(dateStr: string, withTime: boolean = true): string {
  const d = new Date(dateStr);
  const datePart = d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  if (!withTime) return datePart;
  const timePart = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  return `${datePart}, ${timePart}`;
}

export function formatRelative(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} minutes ago`;
  if (diffHr < 24) return `${diffHr} hours ago`;
  if (diffDay < 7) return `${diffDay} days ago`;
  return formatDate(dateStr, false);
}

export function getDaysUntil(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  return Math.ceil(diffMs / (24 * 60 * 60 * 1000));
}

export function getMonthKey(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function getMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  const d = new Date(Number(year), Number(month) - 1, 1);
  return d.toLocaleDateString("id-ID", { month: "short", year: "numeric" });
}

export function getLast12Months(): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(getMonthKey(d));
  }
  return keys;
}

export function getPercentage(part: number, total: number): number {
  if (total === 0) return 0;
  return (part / total) * 100;
}

// Generate auto invoice number: INV-2026-001
export function generateInvoiceNumber(existing: string[]): string {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  const nums = existing
    .filter((n) => n.startsWith(prefix))
    .map((n) => parseInt(n.replace(prefix, ""), 10))
    .filter((n) => !isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `${prefix}${String(next).padStart(3, "0")}`;
}

// VALIDATION

export function validateTransactionInput(input: Partial<TransactionInput>): string[] {
  const errors: string[] = [];
  if (!input.type || !["INCOME", "EXPENSE"].includes(input.type)) {
    errors.push("Transaction type must be INCOME or EXPENSE");
  }
  if (!input.source || input.source.trim().length === 0) {
    errors.push("Item name is required");
  }
  if (input.source && input.source.length > 200) {
    errors.push("Item name must be at most 200 characters");
  }
  if (!input.category || input.category.trim().length === 0) {
    errors.push("Category is required");
  }
  if (typeof input.amountOriginal !== "number" || input.amountOriginal <= 0) {
    errors.push("Amount must be a number greater than 0");
  }
  if (!input.currency) {
    errors.push("Currency is required");
  }
  if (typeof input.exchangeRate !== "number" || input.exchangeRate <= 0) {
    errors.push("Exchange rate must be greater than 0");
  }
  if (!input.date) {
    errors.push("Date is required");
  }
  if (input.type === "INCOME" && input.incomeType && !["AKTIF", "PASIF"].includes(input.incomeType)) {
    errors.push("Income type must be AKTIF or PASIF");
  }
  return errors;
}
