"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Transaction,
  TransactionInput,
  TransactionType,
  IncomeType,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  CURRENCIES,
  CURRENCY_MAP,
  formatCurrency,
  AccountType,
  ContactType,
} from "@/lib/constants";
import {
  useCreateTransaction,
  useUpdateTransaction,
  useAccounts,
  useContacts,
} from "@/hooks/use-transactions";
import { Loader2, Save, AlertCircle, Wallet, Users } from "lucide-react";

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTransaction: Transaction | null;
}

function toLocalDatetimeInput(d: Date): string {
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export function TransactionForm({
  open,
  onOpenChange,
  editingTransaction,
}: TransactionFormProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] bg-card border-border max-h-[92vh] overflow-y-auto">
        {open && (
          <TransactionFormInner
            key={editingTransaction?.id ?? "new"}
            editingTransaction={editingTransaction}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface InnerProps {
  editingTransaction: Transaction | null;
  onOpenChange: (open: boolean) => void;
}

function TransactionFormInner({ editingTransaction, onOpenChange }: InnerProps) {
  const isEditing = !!editingTransaction;
  const createMut = useCreateTransaction();
  const updateMut = useUpdateTransaction();
  const isPending = createMut.isPending || updateMut.isPending;

  const { data: accounts } = useAccounts();
  const { data: contacts } = useContacts();

  // Initial values
  const initialType: TransactionType = editingTransaction?.type ?? "INCOME";
  const initialSource = editingTransaction?.source ?? "";
  const initialCategory = editingTransaction?.category ?? "";
  const initialIncomeType: IncomeType = editingTransaction?.incomeType ?? "AKTIF";
  const initialCurrency = editingTransaction?.currency ?? "IDR";
  const initialAmountOriginal = editingTransaction ? editingTransaction.amountOriginal.toString() : "";
  const initialExchangeRate = editingTransaction
    ? editingTransaction.exchangeRate.toString()
    : (CURRENCY_MAP[initialCurrency]?.defaultRateToIDR || 1).toString();
  const initialDate = editingTransaction
    ? toLocalDatetimeInput(new Date(editingTransaction.date))
    : toLocalDatetimeInput(new Date());
  const initialNote = editingTransaction?.note ?? "";
  const initialAccountId = editingTransaction?.accountId ?? null;
  const initialContactId = editingTransaction?.contactId ?? null;

  // State
  const [type, setType] = useState<TransactionType>(initialType);
  const [source, setSource] = useState(initialSource);
  const [category, setCategory] = useState(initialCategory);
  const [incomeType, setIncomeType] = useState<IncomeType>(initialIncomeType);
  const [currency, setCurrency] = useState(initialCurrency);
  const [amountOriginal, setAmountOriginal] = useState(initialAmountOriginal);
  const [exchangeRate, setExchangeRate] = useState(initialExchangeRate);
  const [date, setDate] = useState(initialDate);
  const [note, setNote] = useState(initialNote);
  const [accountId, setAccountId] = useState<string | null>(initialAccountId);
  const [contactId, setContactId] = useState<string | null>(initialContactId);
  const [error, setError] = useState<string | null>(null);

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (category) {
      const validForNewType =
        newType === "INCOME"
          ? INCOME_CATEGORIES.some((c) => c.value === category)
          : EXPENSE_CATEGORIES.some((c) => c.value === category);
      if (!validForNewType) setCategory("");
    }
  };

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
    // Auto-update exchange rate to default for new currency
    const defaultRate = CURRENCY_MAP[newCurrency]?.defaultRateToIDR || 1;
    setExchangeRate(defaultRate.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!source.trim()) {
      setError("Item name is required");
      return;
    }
    if (!category) {
      setError("Category is required");
      return;
    }
    const numAmount = Number(amountOriginal);
    if (!amountOriginal || isNaN(numAmount) || numAmount <= 0) {
      setError("Amount must be a number greater than 0");
      return;
    }
    const numRate = Number(exchangeRate);
    if (!exchangeRate || isNaN(numRate) || numRate <= 0) {
      setError("Exchange rate must be greater than 0");
      return;
    }
    if (!date) {
      setError("Date is required");
      return;
    }

    const input: TransactionInput = {
      type,
      source: source.trim(),
      category,
      incomeType: type === "INCOME" ? incomeType : null,
      currency,
      amountOriginal: numAmount,
      exchangeRate: numRate,
      date,
      note: note.trim() || null,
      accountId: accountId || null,
      contactId: contactId || null,
    };

    if (isEditing && editingTransaction) {
      updateMut.mutate(
        { id: editingTransaction.id, input },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createMut.mutate(input, { onSuccess: () => onOpenChange(false) });
    }
  };

  const categories = type === "INCOME" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const cur = CURRENCY_MAP[currency];

  const numAmount = Number(amountOriginal) || 0;
  const numRate = Number(exchangeRate) || 0;
  const amountBase = numAmount * numRate;
  const previewOriginal = numAmount > 0 ? formatCurrency(numAmount, currency) : null;
  const previewBase = numAmount > 0 && numRate > 0 ? formatCurrency(amountBase, "IDR") : null;

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          {isEditing ? "Edit Transaction" : "Add Transaction"}
        </DialogTitle>
        <DialogDescription className="text-muted-foreground">
          {isEditing
            ? "Edit transaction details. Changes are saved instantly to the database."
            : "Fill in transaction details. After clicking Save, data is instantly stored in the database."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Selector */}
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            Transaction Type
          </Label>
          <RadioGroup
            value={type}
            onValueChange={(v) => handleTypeChange(v as TransactionType)}
            className="grid grid-cols-2 gap-2"
          >
            <label
              className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors ${
                type === "INCOME"
                  ? "border-emerald-500/50 bg-emerald-500/10 text-income"
                  : "border-border bg-background hover:bg-accent"
              }`}
            >
              <RadioGroupItem value="INCOME" className="sr-only" />
              <span className="text-emerald-500">↑</span>
              Income
            </label>
            <label
              className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors ${
                type === "EXPENSE"
                  ? "border-red-500/50 bg-red-500/10 text-expense"
                  : "border-border bg-background hover:bg-accent"
              }`}
            >
              <RadioGroupItem value="EXPENSE" className="sr-only" />
              <span className="text-red-500">↓</span>
              Expense
            </label>
          </RadioGroup>
        </div>

        {/* Source / Item Name */}
        <div className="space-y-2">
          <Label htmlFor="source">
            Item Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="source"
            placeholder={type === "INCOME" ? "e.g. Main Business Revenue" : "e.g. Buy Tesla"}
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="bg-background"
            autoFocus
            maxLength={200}
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">
            Category <span className="text-destructive">*</span>
          </Label>
          <Select value={category || undefined} onValueChange={setCategory}>
            <SelectTrigger id="category" className="bg-background">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {type === "INCOME" && category && (
            <p className="text-[11px] text-muted-foreground">
              {(() => {
                const cat = INCOME_CATEGORIES.find((c) => c.value === category);
                if (!cat) return null;
                return (
                  <>
                    Detected income type:{" "}
                    <span className={cat.incomeType === "PASIF" ? "text-passive font-medium" : "text-income font-medium"}>
                      {cat.incomeType === "PASIF" ? "Passive" : "Active"}
                    </span>
                    {cat.incomeType !== incomeType && (
                      <button type="button" onClick={() => setIncomeType(cat.incomeType)} className="ml-2 text-gold underline">
                        Set to {cat.incomeType === "PASIF" ? "Passive" : "Active"}
                      </button>
                    )}
                  </>
                );
              })()}
            </p>
          )}
        </div>

        {/* Currency + Amount + Exchange Rate */}
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-2">
            <Label htmlFor="currency" className="text-xs">Currency</Label>
            <Select value={currency} onValueChange={handleCurrencyChange}>
              <SelectTrigger id="currency" className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="amount">
              Amount ({cur?.symbol}) <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-mono">
                {cur?.symbol}
              </span>
              <Input
                id="amount"
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={amountOriginal}
                onChange={(e) => setAmountOriginal(e.target.value)}
                className="pl-9 bg-background font-mono tnum"
                min="0"
                step="any"
              />
            </div>
          </div>
        </div>

        {/* Exchange rate (only when currency != IDR) */}
        {currency !== "IDR" && (
          <div className="space-y-2">
            <Label htmlFor="rate" className="text-xs">
              Exchange Rate (1 {currency} = ? IDR) <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                1 {currency} =
              </span>
              <Input
                id="rate"
                type="number"
                inputMode="numeric"
                placeholder={CURRENCY_MAP[currency]?.defaultRateToIDR.toString()}
                value={exchangeRate}
                onChange={(e) => setExchangeRate(e.target.value)}
                className="pl-24 bg-background font-mono tnum"
                min="0"
                step="any"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                IDR
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Check the latest rate on Google or Google Finance. Update manually per transaction for accuracy.
            </p>
          </div>
        )}

        {/* Preview */}
        {(previewOriginal || previewBase) && (
          <div className="rounded-md border border-amber-400/20 bg-amber-400/5 px-3 py-2 flex items-center justify-between gap-3">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Preview</span>
            <div className="flex items-center gap-2 text-sm">
              {previewOriginal && (
                <span className="text-gold font-mono tnum font-semibold">{previewOriginal}</span>
              )}
              {previewBase && currency !== "IDR" && (
                <>
                  <span className="text-muted-foreground text-xs">≈</span>
                  <span className="text-muted-foreground font-mono tnum text-xs">{previewBase}</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Date */}
        <div className="space-y-2">
          <Label htmlFor="date">
            Date & Time <span className="text-destructive">*</span>
          </Label>
          <Input
            id="date"
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-background"
            required
          />
        </div>

        {/* Account & Contact (2 col) */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor="account" className="text-xs flex items-center gap-1">
              <Wallet className="h-3 w-3" /> Account
              <span className="text-muted-foreground text-[10px]">(optional)</span>
            </Label>
            <Select
              value={accountId ?? "none"}
              onValueChange={(v) => setAccountId(v === "none" ? null : v)}
            >
              <SelectTrigger id="account" className="bg-background">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— None —</SelectItem>
                {(accounts || []).map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name} ({acc.currency})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact" className="text-xs flex items-center gap-1">
              <Users className="h-3 w-3" /> Partner
              <span className="text-muted-foreground text-[10px]">(optional)</span>
            </Label>
            <Select
              value={contactId ?? "none"}
              onValueChange={(v) => setContactId(v === "none" ? null : v)}
            >
              <SelectTrigger id="contact" className="bg-background">
                <SelectValue placeholder="Select client/vendor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— None —</SelectItem>
                {(contacts || []).map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Note */}
        <div className="space-y-2">
          <Label htmlFor="note">
            Notes <span className="text-muted-foreground text-xs">(optional)</span>
          </Label>
          <Textarea
            id="note"
            placeholder="Add notes for this transaction..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="bg-background resize-none"
            rows={2}
            maxLength={1000}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="bg-background"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="bg-gold text-primary-foreground hover:bg-amber-300 min-w-[140px]"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? "Update Transaction" : "Save Transaction"}
              </>
            )}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

// Re-export types used by parent
export type { AccountType, ContactType };
