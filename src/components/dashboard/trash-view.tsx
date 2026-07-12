"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Transaction, formatCurrency, formatIDR, formatDate, CURRENCY_MAP } from "@/lib/constants";
import {
  useTransactions,
  useRestoreTransaction,
  usePermanentDeleteTransaction,
} from "@/hooks/use-transactions";
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
import { Trash2, RotateCcw, AlertTriangle, Inbox } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function TrashView() {
  const { data: trashItems, isLoading } = useTransactions({ includeDeleted: true });
  const restoreMut = useRestoreTransaction();
  const permanentDeleteMut = usePermanentDeleteTransaction();
  const [pendingPermanent, setPendingPermanent] = useState<Transaction | null>(null);

  const sortedTrash = [...(trashItems || [])].sort(
    (a, b) => new Date(b.deletedAt!).getTime() - new Date(a.deletedAt!).getTime()
  );

  const getDaysLeft = (deletedAt: string): number => {
    const deleted = new Date(deletedAt);
    const expire = new Date(deleted.getTime() + 30 * 24 * 60 * 60 * 1000);
    const now = new Date();
    return Math.max(0, Math.ceil((expire.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
  };

  const confirmPermanentDelete = () => {
    if (pendingPermanent) {
      permanentDeleteMut.mutate(pendingPermanent.id);
      setPendingPermanent(null);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-destructive/10">
            <Trash2 className="h-4 w-4 text-destructive" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">TRASH</h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {sortedTrash.length} transactions • Auto-permanently deleted after 30 days
            </p>
          </div>
        </div>
      </div>

      <div className="max-h-[600px] overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 rounded bg-muted" />
            ))}
          </div>
        ) : sortedTrash.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <Inbox className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Trash is empty</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium pl-5">
                  Item Name
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  Type
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  Transaction Date
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  Deleted On
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  Days Left
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium text-right">
                  Amount
                </TableHead>
                <TableHead className="text-right pr-5 w-[140px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTrash.map((tx) => {
                const daysLeft = getDaysLeft(tx.deletedAt!);
                const isExpiringSoon = daysLeft <= 7;
                const isForeign = tx.currency !== "IDR";
                return (
                  <TableRow
                    key={tx.id}
                    className="border-border/50 hover:bg-muted/40 group opacity-75 hover:opacity-100"
                  >
                    <TableCell className="pl-5 py-3">
                      <div className="font-medium text-sm">{tx.source}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {tx.category}
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-medium ${
                          tx.type === "INCOME"
                            ? "border-income/40 text-income"
                            : "border-expense/40 text-expense"
                        }`}
                      >
                        {tx.type === "INCOME" ? "Income" : "Expense"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 text-xs tnum">
                      {formatDate(tx.date, false)}
                    </TableCell>
                    <TableCell className="py-3 text-xs tnum text-muted-foreground">
                      {formatDate(tx.deletedAt!, true)}
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-medium ${
                          isExpiringSoon
                            ? "border-destructive/40 text-destructive bg-destructive/10"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {isExpiringSoon && <AlertTriangle className="h-2.5 w-2.5 mr-1" />}
                        {daysLeft} days
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={`py-3 text-right pr-5 font-mono tnum font-semibold ${
                        tx.type === "INCOME" ? "text-income" : "text-expense"
                      }`}
                    >
                      <div className="flex flex-col items-end">
                        <span>
                          {CURRENCY_MAP[tx.currency]?.flag} {formatCurrency(tx.amountOriginal, tx.currency)}
                        </span>
                        {isForeign && (
                          <span className="text-[10px] text-muted-foreground font-normal tnum">
                            ≈ {formatIDR(tx.amountBase, { compact: true })}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 pr-5">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 gap-1 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-400"
                          onClick={() => restoreMut.mutate(tx.id)}
                          disabled={restoreMut.isPending}
                        >
                          <RotateCcw className="h-3 w-3" />
                          Restore
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-destructive hover:bg-destructive/10"
                          onClick={() => setPendingPermanent(tx)}
                          title="Delete permanently (cannot be undone)"
                        >
                          <Trash2 className="h-3 w-3" />
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

      <AlertDialog
        open={!!pendingPermanent}
        onOpenChange={(o) => !o && setPendingPermanent(null)}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              Delete Permanently?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Transaction <span className="font-medium text-foreground">{pendingPermanent?.source}</span> will be permanently deleted from the database. This action <span className="font-semibold text-destructive">cannot be undone</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-background">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmPermanentDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
