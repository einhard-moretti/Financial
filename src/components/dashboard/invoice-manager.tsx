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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useInvoices,
  useCreateInvoice,
  useUpdateInvoice,
  useDeleteInvoice,
  useSendInvoice,
  useMarkInvoicePaid,
  useAccounts,
  useContacts,
} from "@/hooks/use-transactions";
import {
  Invoice,
  InvoiceInput,
  InvoiceStatus,
  INVOICE_STATUS_MAP,
  CURRENCIES,
  CURRENCY_MAP,
  formatCurrency,
  formatDate,
  getDaysUntil,
} from "@/lib/constants";
import {
  Plus,
  FileText,
  Send,
  CheckCircle2,
  Trash2,
  Pencil,
  AlertTriangle,
  Loader2,
  Inbox,
  Clock,
} from "lucide-react";

export function InvoiceManager() {
  const { data: invoices, isLoading } = useInvoices();
  const [formOpen, setFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Invoice | null>(null);

  const sendMut = useSendInvoice();
  const markPaidMut = useMarkInvoicePaid();
  const deleteMut = useDeleteInvoice();

  // Stats
  const stats = (invoices || []).reduce(
    (acc, inv) => {
      const base = inv.amountBase;
      if (inv.status === "PAID") {
        acc.paid += base;
        acc.paidCount++;
      } else if (inv.status === "OVERDUE") {
        acc.overdue += base;
        acc.overdueCount++;
      } else if (inv.status === "SENT" || inv.status === "PARTIAL") {
        acc.pending += base;
        acc.pendingCount++;
      } else if (inv.status === "DRAFT") {
        acc.draftCount++;
      }
      acc.total += base;
      return acc;
    },
    { paid: 0, pending: 0, overdue: 0, total: 0, paidCount: 0, pendingCount: 0, overdueCount: 0, draftCount: 0 }
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-gold" />
            Invoice & Receivable Tracking
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Track invoices you send to clients. Mark as paid → auto-create an income transaction.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditingInvoice(null);
            setFormOpen(true);
          }}
          className="bg-gold text-primary-foreground hover:bg-amber-300"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Create Invoice
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Card className="border-emerald-500/30 bg-card p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Paid (PAID)</p>
          <p className="text-base font-bold tnum text-income mt-1">{formatCurrency(stats.paid, "IDR", { compact: stats.paid > 1_000_000_000 })}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{stats.paidCount} invoice</p>
        </Card>
        <Card className="border-sky-500/30 bg-card p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Pending (SENT/PARTIAL)</p>
          <p className="text-base font-bold tnum text-sky-400 mt-1">{formatCurrency(stats.pending, "IDR", { compact: stats.pending > 1_000_000_000 })}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{stats.pendingCount} invoice</p>
        </Card>
        <Card className="border-red-500/30 bg-card p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Overdue (OVERDUE)</p>
          <p className="text-base font-bold tnum text-expense mt-1">{formatCurrency(stats.overdue, "IDR", { compact: stats.overdue > 1_000_000_000 })}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{stats.overdueCount} invoice</p>
        </Card>
        <Card className="border-border bg-card p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Draft</p>
          <p className="text-base font-bold tnum mt-1">{stats.draftCount}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Not sent yet</p>
        </Card>
      </div>

      {/* Invoice table */}
      <Card className="border-border bg-card overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 mx-auto mb-2 animate-spin" />
              Loading invoices...
            </div>
          ) : (invoices || []).length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Inbox className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                No invoices yet. Create your first invoice.
              </p>
              <Button
                size="sm"
                onClick={() => {
                  setEditingInvoice(null);
                  setFormOpen(true);
                }}
                className="bg-gold text-primary-foreground hover:bg-amber-300"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Create Invoice
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium pl-5">
                    Invoice #
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                    Client
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                    Title
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                    Status
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                    Issue → Due
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium text-right">
                    Amount
                  </TableHead>
                  <TableHead className="text-right pr-5 w-[200px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(invoices || []).map((inv) => {
                  const daysLeft = getDaysUntil(inv.dueDate);
                  const isOverdue = inv.status === "OVERDUE";
                  const statusInfo = INVOICE_STATUS_MAP[inv.status as InvoiceStatus];
                  return (
                    <TableRow
                      key={inv.id}
                      className="border-border/50 hover:bg-muted/40 group"
                    >
                      <TableCell className="pl-5 py-3">
                        <div className="font-mono text-xs text-gold font-medium">{inv.number}</div>
                      </TableCell>
                      <TableCell className="py-3 text-xs">
                        {inv.contact?.name || <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="text-sm font-medium line-clamp-1">{inv.title}</div>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge variant="outline" className={`text-[10px] font-medium ${statusInfo.badgeClass}`}>
                          {statusInfo.label}
                        </Badge>
                        {isOverdue && (
                          <div className="text-[10px] text-destructive mt-1 flex items-center gap-0.5">
                            <AlertTriangle className="h-2.5 w-2.5" />
                            {Math.abs(daysLeft)} days overdue
                          </div>
                        )}
                        {!isOverdue && (inv.status === "SENT" || inv.status === "PARTIAL") && (
                          <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-0.5">
                            <Clock className="h-2.5 w-2.5" />
                            {daysLeft > 0 ? `${daysLeft} days left` : "Due today"}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="py-3 text-xs text-muted-foreground tnum">
                        <div>{formatDate(inv.issueDate, false)}</div>
                        <div className="text-[10px]">→ {formatDate(inv.dueDate, false)}</div>
                      </TableCell>
                      <TableCell className="py-3 text-right pr-5">
                        <div className="font-mono tnum font-semibold text-sm">
                          {formatCurrency(inv.amountOriginal, inv.currency)}
                        </div>
                        {inv.currency !== "IDR" && (
                          <div className="text-[10px] text-muted-foreground font-mono tnum">
                            ≈ {formatCurrency(inv.amountBase, "IDR", { compact: true })}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="py-3 pr-5">
                        <div className="flex items-center justify-end gap-1">
                          {inv.status === "DRAFT" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1 text-sky-400 hover:bg-sky-500/10"
                              onClick={() => sendMut.mutate(inv.id)}
                              disabled={sendMut.isPending}
                            >
                              <Send className="h-3 w-3" />
                              Send
                            </Button>
                          )}
                          {(inv.status === "SENT" || inv.status === "PARTIAL" || inv.status === "OVERDUE") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1 text-emerald-400 hover:bg-emerald-500/10"
                              onClick={() => markPaidMut.mutate({ id: inv.id })}
                              disabled={markPaidMut.isPending}
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              Mark Paid
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:bg-accent"
                            onClick={() => {
                              setEditingInvoice(inv);
                              setFormOpen(true);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setPendingDelete(inv)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      {/* Form */}
      <InvoiceForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editingInvoice={editingInvoice}
      />

      {/* Delete confirm */}
      {pendingDelete && (
        <Dialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
          <DialogContent className="sm:max-w-[420px] bg-card border-border">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-4 w-4" />
                Delete Invoice?
              </DialogTitle>
              <DialogDescription>
                Invoice <span className="font-mono text-gold">{pendingDelete.number}</span> — {pendingDelete.title} will be deleted. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPendingDelete(null)} className="bg-background">Cancel</Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (pendingDelete) deleteMut.mutate(pendingDelete.id);
                  setPendingDelete(null);
                }}
              >
                Yes, delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Invoice Form (Add/Edit)
function InvoiceForm({
  open,
  onOpenChange,
  editingInvoice,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editingInvoice: Invoice | null;
}) {
  const createMut = useCreateInvoice();
  const updateMut = useUpdateInvoice();
  const isPending = createMut.isPending || updateMut.isPending;
  const { data: accounts } = useAccounts();
  const { data: contacts } = useContacts();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] bg-card border-border max-h-[92vh] overflow-y-auto">
        {open && (
          <InvoiceFormInner
            key={editingInvoice?.id ?? "new"}
            editingInvoice={editingInvoice}
            onOpenChange={onOpenChange}
            isPending={isPending}
            createMut={createMut}
            updateMut={updateMut}
            accounts={accounts || []}
            contacts={contacts || []}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function InvoiceFormInner({
  editingInvoice,
  onOpenChange,
  isPending,
  createMut,
  updateMut,
  accounts,
  contacts,
}: {
  editingInvoice: Invoice | null;
  onOpenChange: (o: boolean) => void;
  isPending: boolean;
  createMut: ReturnType<typeof useCreateInvoice>;
  updateMut: ReturnType<typeof useUpdateInvoice>;
  accounts: { id: string; name: string; currency: string }[];
  contacts: { id: string; name: string }[];
}) {
  const [title, setTitle] = useState(editingInvoice?.title ?? "");
  const [currency, setCurrency] = useState(editingInvoice?.currency ?? "IDR");
  const [amountOriginal, setAmountOriginal] = useState(
    editingInvoice ? editingInvoice.amountOriginal.toString() : ""
  );
  const [exchangeRate, setExchangeRate] = useState(
    editingInvoice
      ? editingInvoice.exchangeRate.toString()
      : (CURRENCY_MAP[currency]?.defaultRateToIDR || 1).toString()
  );
  const today = new Date();
  const inFourteen = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
  const [issueDate, setIssueDate] = useState(
    editingInvoice ? new Date(editingInvoice.issueDate).toISOString().slice(0, 10) : today.toISOString().slice(0, 10)
  );
  const [dueDate, setDueDate] = useState(
    editingInvoice ? new Date(editingInvoice.dueDate).toISOString().slice(0, 10) : inFourteen.toISOString().slice(0, 10)
  );
  const [contactId, setContactId] = useState<string | null>(editingInvoice?.contactId ?? null);
  const [accountId, setAccountId] = useState<string | null>(editingInvoice?.accountId ?? null);
  const [notes, setNotes] = useState(editingInvoice?.notes ?? "");
  const [error, setError] = useState<string | null>(null);

  const handleCurrencyChange = (newCur: string) => {
    setCurrency(newCur);
    setExchangeRate((CURRENCY_MAP[newCur]?.defaultRateToIDR || 1).toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Invoice title is required");
      return;
    }
    const numAmount = Number(amountOriginal);
    if (!amountOriginal || isNaN(numAmount) || numAmount <= 0) {
      setError("Amount must be greater than 0");
      return;
    }
    if (new Date(dueDate) < new Date(issueDate)) {
      setError("Due date cannot be before issue date");
      return;
    }

    const payload: InvoiceInput = {
      title: title.trim(),
      currency,
      amountOriginal: numAmount,
      exchangeRate: Number(exchangeRate) || 1,
      issueDate: new Date(issueDate).toISOString(),
      dueDate: new Date(dueDate).toISOString(),
      contactId,
      accountId,
      notes: notes.trim() || undefined,
    };

    if (editingInvoice) {
      updateMut.mutate(
        { id: editingInvoice.id, input: payload },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createMut.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  const cur = CURRENCY_MAP[currency];
  const numAmount = Number(amountOriginal) || 0;
  const numRate = Number(exchangeRate) || 0;
  const amountBase = numAmount * numRate;

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gold" />
          {editingInvoice ? "Edit Invoice" : "Create New Invoice"}
        </DialogTitle>
        <DialogDescription>
          {editingInvoice
            ? `Edit invoice ${editingInvoice.number}`
            : "Invoice number is auto-generated (format: INV-2026-001). Initial status: DRAFT."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="inv-title">
            Invoice Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="inv-title"
            placeholder="e.g. IT Consulting — March 2026, SaaS Subscription Q2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-background"
            autoFocus
            maxLength={200}
          />
        </div>

        {/* Contact & Account */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor="inv-contact" className="text-xs">Client <span className="text-muted-foreground text-[10px]">(optional)</span></Label>
            <Select value={contactId ?? "none"} onValueChange={(v) => setContactId(v === "none" ? null : v)}>
              <SelectTrigger id="inv-contact" className="bg-background">
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— None —</SelectItem>
                {contacts.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="inv-account" className="text-xs">Receiving Account <span className="text-muted-foreground text-[10px]">(optional)</span></Label>
            <Select value={accountId ?? "none"} onValueChange={(v) => setAccountId(v === "none" ? null : v)}>
              <SelectTrigger id="inv-account" className="bg-background">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— None —</SelectItem>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name} ({a.currency})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Currency + Amount */}
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-2">
            <Label htmlFor="inv-currency" className="text-xs">Currency</Label>
            <Select value={currency} onValueChange={handleCurrencyChange}>
              <SelectTrigger id="inv-currency" className="bg-background">
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
            <Label htmlFor="inv-amount">
              Amount ({cur?.symbol}) <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-mono">
                {cur?.symbol}
              </span>
              <Input
                id="inv-amount"
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

        {/* Exchange rate for non-IDR */}
        {currency !== "IDR" && (
          <div className="space-y-2">
            <Label htmlFor="inv-rate" className="text-xs">
              Exchange Rate (1 {currency} = ? IDR) <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                1 {currency} =
              </span>
              <Input
                id="inv-rate"
                type="number"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(e.target.value)}
                className="pl-24 bg-background font-mono tnum"
                min="0"
                step="any"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">IDR</span>
            </div>
          </div>
        )}

        {/* Preview */}
        {numAmount > 0 && numRate > 0 && (
          <div className="rounded-md border border-amber-400/20 bg-amber-400/5 px-3 py-2 flex items-center justify-between gap-3">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Total Invoice</span>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gold font-mono tnum font-semibold">
                {formatCurrency(numAmount, currency)}
              </span>
              {currency !== "IDR" && (
                <>
                  <span className="text-muted-foreground text-xs">≈</span>
                  <span className="text-muted-foreground font-mono tnum text-xs">
                    {formatCurrency(amountBase, "IDR")}
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Issue & Due dates */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor="inv-issue">Issue Date <span className="text-destructive">*</span></Label>
            <Input
              id="inv-issue"
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="bg-background"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inv-due">Due Date <span className="text-destructive">*</span></Label>
            <Input
              id="inv-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-background"
              required
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="inv-notes">
            Notes <span className="text-muted-foreground text-xs">(optional)</span>
          </Label>
          <Textarea
            id="inv-notes"
            placeholder="e.g. Payment via bank transfer, 50/50 installments"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-background resize-none"
            rows={2}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
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
            ) : editingInvoice ? "Update Invoice" : "Create Invoice"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
