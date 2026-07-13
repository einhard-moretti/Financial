"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useAccounts,
  useCreateAccount,
  useUpdateAccount,
  useArchiveAccount,
} from "@/hooks/use-transactions";
import {
  Account,
  AccountType,
  ACCOUNT_TYPES,
  CURRENCIES,
  CURRENCY_MAP,
  formatCurrency,
} from "@/lib/constants";
import { Plus, Pencil, Wallet, Archive, Banknote, Smartphone, Banknote as Cash, Bitcoin, TrendingUp, Loader2 } from "lucide-react";

const ACCOUNT_TYPE_ICONS: Record<AccountType, React.ReactNode> = {
  BANK: <Banknote className="h-4 w-4" />,
  EWALLET: <Smartphone className="h-4 w-4" />,
  CASH: <Cash className="h-4 w-4" />,
  CRYPTO: <Bitcoin className="h-4 w-4" />,
  INVESTMENT: <TrendingUp className="h-4 w-4" />,
};

export function AccountManager() {
  const { data: accounts, isLoading } = useAccounts();
  const [formOpen, setFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [pendingArchive, setPendingArchive] = useState<Account | null>(null);
  const archiveMut = useArchiveAccount();

  const handleAdd = () => {
    setEditingAccount(null);
    setFormOpen(true);
  };

  const handleEdit = (acc: Account) => {
    setEditingAccount(acc);
    setFormOpen(true);
  };

  // Group by currency for total display
  const totalsByCurrency = (accounts || []).reduce<Record<string, number>>((acc, a) => {
    acc[a.currency] = (acc[a.currency] || 0) + (a.currentBalance || 0);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Wallet className="h-4 w-4 text-gold" />
            Account / Wallet List
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Manage banks, e-wallets, cash, and crypto wallets. Balance is automatically calculated from transactions.
          </p>
        </div>
        <Button size="sm" onClick={handleAdd} className="bg-gold text-primary-foreground hover:bg-amber-300">
          <Plus className="h-4 w-4 mr-1.5" />
          Add Account
        </Button>
      </div>

      {/* Total by currency */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {Object.entries(totalsByCurrency).length === 0 ? (
          <div className="col-span-full text-center text-xs text-muted-foreground py-4">
            No accounts yet. Add one to start tracking balances.
          </div>
        ) : (
          Object.entries(totalsByCurrency).map(([cur, total]) => (
            <Card key={cur} className="border-border bg-card p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Total {cur}
              </p>
              <p className="text-base font-bold tnum mt-1">
                {formatCurrency(total, cur)}
              </p>
            </Card>
          ))
        )}
      </div>

      {/* Accounts grid */}
      {isLoading ? (
        <Card className="border-border bg-card p-8 text-center text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 mx-auto mb-2 animate-spin" />
          Loading accounts...
        </Card>
      ) : (accounts || []).length === 0 ? (
        <Card className="border-dashed border-border bg-card p-12 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Wallet className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            No accounts yet. Add one to start tracking balance per wallet.
          </p>
          <Button size="sm" onClick={handleAdd} className="bg-gold text-primary-foreground hover:bg-amber-300">
            <Plus className="h-4 w-4 mr-1.5" />
            Add First Account
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(accounts || []).map((acc) => {
            const cur = CURRENCY_MAP[acc.currency];
            const typeInfo = ACCOUNT_TYPES.find((t) => t.value === acc.type);
            return (
              <Card
                key={acc.id}
                className="border-border bg-card p-4 hover:border-amber-400/30 transition-colors group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400/10 text-gold">
                      {ACCOUNT_TYPE_ICONS[acc.type]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-tight">{acc.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {typeInfo?.label} • {cur?.flag} {acc.currency}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleEdit(acc)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setPendingArchive(acc)}
                    >
                      <Archive className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Current Balance
                  </p>
                  <p className="text-xl font-bold tnum mt-0.5">
                    {formatCurrency(acc.currentBalance || 0, acc.currency)}
                  </p>
                  {acc.currency !== "IDR" && (
                    <p className="text-[11px] text-muted-foreground mt-0.5 font-mono tnum">
                      ≈ {formatCurrency(acc.currentBalanceBase || 0, "IDR", { compact: true })}
                    </p>
                  )}
                </div>
                {acc.initialBalance > 0 && (
                  <div className="mt-2 pt-2 border-t border-border/60">
                    <p className="text-[10px] text-muted-foreground">
                      Initial: <span className="font-mono tnum">{formatCurrency(acc.initialBalance, acc.currency)}</span>
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Form dialog */}
      <AccountForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editingAccount={editingAccount}
      />

      {/* Archive confirm */}
      <AlertDialog open={!!pendingArchive} onOpenChange={(o) => !o && setPendingArchive(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              Archive Account?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Account <span className="font-medium text-foreground">{pendingArchive?.name}</span> will be archived.
              Existing transactions remain recorded, but the account won't appear in the transaction form dropdown.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-background">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingArchive) archiveMut.mutate(pendingArchive.id);
                setPendingArchive(null);
              }}
              className="bg-amber-500 text-amber-950 hover:bg-amber-400"
            >
              Yes, archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Account Form (Add/Edit)
function AccountForm({
  open,
  onOpenChange,
  editingAccount,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editingAccount: Account | null;
}) {
  const createMut = useCreateAccount();
  const updateMut = useUpdateAccount();
  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] bg-card border-border">
        {open && (
          <AccountFormInner
            key={editingAccount?.id ?? "new"}
            editingAccount={editingAccount}
            onOpenChange={onOpenChange}
            isPending={isPending}
            createMut={createMut}
            updateMut={updateMut}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function AccountFormInner({
  editingAccount,
  onOpenChange,
  isPending,
  createMut,
  updateMut,
}: {
  editingAccount: Account | null;
  onOpenChange: (o: boolean) => void;
  isPending: boolean;
  createMut: ReturnType<typeof useCreateAccount>;
  updateMut: ReturnType<typeof useUpdateAccount>;
}) {
  const [name, setName] = useState(editingAccount?.name ?? "");
  const [currency, setCurrency] = useState(editingAccount?.currency ?? "IDR");
  const [type, setType] = useState<AccountType>(editingAccount?.type ?? "BANK");
  const [initialBalance, setInitialBalance] = useState(
    editingAccount ? editingAccount.initialBalance.toString() : "0"
  );
  const [notes, setNotes] = useState(editingAccount?.notes ?? "");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Account name is required");
      return;
    }

    const payload = {
      name: name.trim(),
      currency,
      type,
      initialBalance: Number(initialBalance) || 0,
      notes: notes.trim() || null,
    };

    if (editingAccount) {
      updateMut.mutate(
        { id: editingAccount.id, input: payload },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createMut.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {editingAccount ? "Edit Account" : "Add New Account"}
        </DialogTitle>
        <DialogDescription className="text-muted-foreground">
          {editingAccount
            ? "Edit account information. Changes are saved instantly."
            : "Add a bank, e-wallet, cash, or crypto wallet to track its balance."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="acc-name">Account Name <span className="text-destructive">*</span></Label>
          <Input
            id="acc-name"
            placeholder="e.g. BCA Business, Wise USD, Office Cash"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-background"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor="acc-type">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as AccountType)}>
              <SelectTrigger id="acc-type" className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.icon} {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="acc-currency">Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger id="acc-currency" className="bg-background">
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="acc-balance">Initial Balance</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-mono">
              {CURRENCY_MAP[currency]?.symbol}
            </span>
            <Input
              id="acc-balance"
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              className="pl-10 bg-background font-mono tnum"
              min="0"
              step="any"
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Enter the current account balance. For credit cards, enter 0. For banks, enter the latest balance.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="acc-notes">Notes <span className="text-muted-foreground text-xs">(optional)</span></Label>
          <Textarea
            id="acc-notes"
            placeholder="e.g. Main business account, no. 1234567890"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-background resize-none"
            rows={2}
          />
        </div>

        {error && (
          <div className="text-sm text-destructive">{error}</div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending} className="bg-background">
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} className="bg-gold text-primary-foreground hover:bg-amber-300">
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : editingAccount ? "Update Account" : "Create Account"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
