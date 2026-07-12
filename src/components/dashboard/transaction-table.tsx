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
import {
  Transaction,
  formatCurrency,
  formatIDR,
  formatDate,
  formatRelative,
  getPercentage,
  CURRENCY_MAP,
} from "@/lib/constants";
import { useDeleteTransaction } from "@/hooks/use-transactions";
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
import { Pencil, Trash2, Inbox, ArrowUpCircle, ArrowDownCircle, Wallet, Users } from "lucide-react";

interface TransactionTableProps {
  type: "INCOME" | "EXPENSE";
  transactions: Transaction[];
  isLoading: boolean;
  onEdit: (tx: Transaction) => void;
}

export function TransactionTable({
  type,
  transactions,
  isLoading,
  onEdit,
}: TransactionTableProps) {
  const deleteMut = useDeleteTransaction();
  const [pendingDelete, setPendingDelete] = useState<Transaction | null>(null);

  // Total in IDR (base) for portion calc
  const totalBase = transactions.reduce((sum, t) => sum + t.amountBase, 0);
  const isIncome = type === "INCOME";

  const confirmDelete = () => {
    if (pendingDelete) {
      deleteMut.mutate(pendingDelete.id);
      setPendingDelete(null);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-7 w-7 items-center justify-center rounded-md ${isIncome ? "bg-income" : "bg-expense"}`}>
            {isIncome ? (
              <ArrowUpCircle className="h-4 w-4 text-income" />
            ) : (
              <ArrowDownCircle className="h-4 w-4 text-expense" />
            )}
          </div>
          <div>
            <h3 className={`text-sm font-semibold ${isIncome ? "text-income" : "text-expense"}`}>
              {isIncome ? "INCOME" : "EXPENSES"}
            </h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {transactions.length} {isIncome ? "sources" : "items"} • Total {formatIDR(totalBase, { compact: totalBase > 1_000_000_000 })}
            </p>
          </div>
        </div>
        <div className={`text-right ${isIncome ? "text-income" : "text-expense"}`}>
          <p className="text-lg font-bold tnum">{formatIDR(totalBase, { compact: totalBase > 1_000_000_000_000_000_000 })}</p>
        </div>
      </div>

      {/* Table */}
      <div className="max-h-[420px] overflow-y-auto">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            Loading...
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <Inbox className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              No {isIncome ? "income" : "expenses"} for this period
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium pl-5 w-[26%]">
                  Item Name
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium w-[12%]">
                  Category
                </TableHead>
                {isIncome && (
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium w-[8%]">
                    Type
                  </TableHead>
                )}
                <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium w-[14%]">
                  Date
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium w-[14%]">
                  Account/Partner
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium text-right w-[8%]">
                  Portion
                </TableHead>
                <TableHead className={`text-[10px] uppercase tracking-wider text-muted-foreground font-medium text-right ${isIncome ? "w-[14%]" : "w-[18%]"}`}>
                  Amount
                </TableHead>
                <TableHead className="text-right pr-5 w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => {
                const portion = getPercentage(tx.amountBase, totalBase);
                const isForeign = tx.currency !== "IDR";
                const cur = CURRENCY_MAP[tx.currency];
                return (
                  <TableRow
                    key={tx.id}
                    className="border-border/50 hover:bg-muted/40 group animate-fade-in-up"
                  >
                    <TableCell className="pl-5 py-3">
                      <div className="font-medium text-sm">{tx.source}</div>
                      {tx.note && (
                        <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                          {tx.note}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge variant="outline" className="text-[10px] font-normal border-border text-muted-foreground">
                        {tx.category}
                      </Badge>
                    </TableCell>
                    {isIncome && (
                      <TableCell className="py-3">
                        {tx.incomeType === "PASIF" ? (
                          <Badge variant="outline" className="text-[10px] font-medium border-passive/40 text-passive bg-passive">
                            Passive
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] font-medium border-income/40 text-income bg-income">
                            Active
                          </Badge>
                        )}
                      </TableCell>
                    )}
                    <TableCell className="py-3">
                      <div className="text-xs tnum">{formatDate(tx.date, false)}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {formatRelative(tx.date)}
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex flex-col gap-0.5">
                        {tx.account && (
                          <span className="text-[10px] flex items-center gap-1 text-muted-foreground">
                            <Wallet className="h-2.5 w-2.5" />
                            {tx.account.name}
                          </span>
                        )}
                        {tx.contact && (
                          <span className="text-[10px] flex items-center gap-1 text-muted-foreground">
                            <Users className="h-2.5 w-2.5" />
                            {tx.contact.name}
                          </span>
                        )}
                        {!tx.account && !tx.contact && (
                          <span className="text-[10px] text-muted-foreground">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <div className="hidden sm:block w-12 h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${isIncome ? "bg-income" : "bg-expense"}`}
                            style={{ width: `${Math.min(portion, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground tnum">{portion.toFixed(1)}%</span>
                      </div>
                    </TableCell>
                    <TableCell className={`py-3 text-right pr-5 font-mono tnum font-semibold ${isIncome ? "text-income" : "text-expense"}`}>
                      <div className="flex flex-col items-end">
                        <span>
                          {cur?.flag} {formatCurrency(tx.amountOriginal, tx.currency)}
                        </span>
                        {isForeign && (
                          <span className="text-[10px] text-muted-foreground font-normal tnum">
                            ≈ {formatIDR(tx.amountBase, { compact: true })}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 pr-5">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:bg-accent"
                          onClick={() => onEdit(tx)}
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setPendingDelete(tx)}
                          title="Delete (move to Trash)"
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

      {/* Delete Confirmation */}
      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-destructive" />
              Move to Trash?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Transaction <span className="font-medium text-foreground">{pendingDelete?.source}</span> ({formatCurrency(pendingDelete?.amountOriginal || 0, pendingDelete?.currency || "IDR")}) will be moved to Trash. You can restore it within 30 days.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-background">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, move to Trash
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
