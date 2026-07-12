"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Summary, formatIDR, getPercentage, formatCurrency, CURRENCY_MAP } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useTransactions,
} from "@/hooks/use-transactions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Scale, TrendingUp, TrendingDown, Activity, Sparkles } from "lucide-react";

interface BalanceSheetProps {
  summary: Summary | undefined;
  isLoading: boolean;
}

export function BalanceSheet({ summary, isLoading }: BalanceSheetProps) {
  const { data: transactions } = useTransactions({});

  if (isLoading || !summary) {
    return <Skeleton className="h-96 rounded-xl bg-card" />;
  }

  // Group income by source
  const incomeBySource = new Map<string, { amountBase: number; currency: string; incomeType: string | null }>();
  const expenseByCategory = new Map<string, number>();

  (transactions || []).forEach((tx) => {
    if (tx.type === "INCOME") {
      const existing = incomeBySource.get(tx.source);
      if (existing) {
        existing.amountBase += tx.amountBase;
      } else {
        incomeBySource.set(tx.source, { amountBase: tx.amountBase, currency: tx.currency, incomeType: tx.incomeType });
      }
    } else {
      expenseByCategory.set(
        tx.category,
        (expenseByCategory.get(tx.category) || 0) + tx.amountBase
      );
    }
  });

  const sortedIncome = Array.from(incomeBySource.entries()).sort((a, b) => b[1].amountBase - a[1].amountBase);
  const sortedExpense = Array.from(expenseByCategory.entries()).sort((a, b) => b[1] - a[1].length);

  const surplus = summary.netCashFlow >= 0;
  const savingsRate = summary.totalIncome > 0
    ? (summary.netCashFlow / summary.totalIncome) * 100
    : 0;

  return (
    <div className="space-y-4">
      {/* Top row: Key ratios */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="border-border bg-card p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              Savings Rate
            </p>
            <Activity className="h-4 w-4 text-gold" />
          </div>
          <p className={`text-2xl font-bold tnum ${savingsRate >= 50 ? "text-income" : savingsRate >= 20 ? "text-gold" : "text-expense"}`}>
            {savingsRate.toFixed(1)}%
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {savingsRate >= 50 ? "Excellent — wealth building mode" : savingsRate >= 20 ? "Good — keep optimizing" : "Need to evaluate expenses"}
          </p>
        </Card>

        <Card className="border-border bg-card p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              Passive Income Ratio
            </p>
            <Sparkles className="h-4 w-4 text-passive" />
          </div>
          <p className="text-2xl font-bold tnum text-passive">
            {summary.passivePercentage.toFixed(1)}%
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {summary.passivePercentage >= 70 ? "Financial freedom achieved" : summary.passivePercentage >= 30 ? "On track" : "Build more passive income"}
          </p>
        </Card>

        <Card className="border-border bg-card p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              Status
            </p>
            <Scale className="h-4 w-4 text-gold" />
          </div>
          <p className={`text-2xl font-bold ${surplus ? "text-gold" : "text-expense"}`}>
            {surplus ? "SURPLUS" : "DEFISIT"}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Net: {formatIDR(summary.netCashFlow, { sign: true })}
          </p>
        </Card>
      </div>

      {/* Two-column balance sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Income Breakdown */}
        <Card className="border-income/30 bg-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-income/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-income" />
              <h3 className="text-sm font-semibold text-income">INCOME</h3>
            </div>
            <p className="text-sm font-bold tnum text-income">{formatIDR(summary.totalIncome)}</p>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-[10px] uppercase text-muted-foreground font-medium pl-5">Source</TableHead>
                  <TableHead className="text-[10px] uppercase text-muted-foreground font-medium">Type</TableHead>
                  <TableHead className="text-[10px] uppercase text-muted-foreground font-medium text-right">Portion</TableHead>
                  <TableHead className="text-[10px] uppercase text-muted-foreground font-medium text-right pr-5">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedIncome.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-8">
                      No income recorded yet
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedIncome.map(([source, data]) => {
                    const portion = getPercentage(data.amountBase, summary.totalIncome);
                    return (
                      <TableRow key={source} className="border-border/50 hover:bg-muted/40">
                        <TableCell className="pl-5 py-3">
                          <div className="text-sm font-medium">{source}</div>
                          {data.currency !== "IDR" && (
                            <div className="text-[10px] text-muted-foreground">
                              {CURRENCY_MAP[data.currency]?.flag} {data.currency}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="py-3">
                          {data.incomeType === "PASIF" ? (
                            <Badge variant="outline" className="text-[10px] border-passive/40 text-passive bg-passive">Passive</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] border-income/40 text-income bg-income">Active</Badge>
                          )}
                        </TableCell>
                        <TableCell className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-income" style={{ width: `${Math.min(portion, 100)}%` }} />
                            </div>
                            <span className="text-xs text-muted-foreground tnum">{portion.toFixed(1)}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 text-right pr-5 font-mono tnum font-semibold text-income">
                          {formatIDR(data.amountBase)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Expense Breakdown */}
        <Card className="border-expense/30 bg-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-expense/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-expense" />
              <h3 className="text-sm font-semibold text-expense">EXPENSES</h3>
            </div>
            <p className="text-sm font-bold tnum text-expense">{formatIDR(summary.totalExpense)}</p>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-[10px] uppercase text-muted-foreground font-medium pl-5">Category</TableHead>
                  <TableHead className="text-[10px] uppercase text-muted-foreground font-medium text-right">Portion</TableHead>
                  <TableHead className="text-[10px] uppercase text-muted-foreground font-medium text-right pr-5">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedExpense.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-sm text-muted-foreground py-8">
                      No expenses recorded yet
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedExpense.map(([category, amount]) => {
                    const portion = getPercentage(amount, summary.totalExpense);
                    return (
                      <TableRow key={category} className="border-border/50 hover:bg-muted/40">
                        <TableCell className="pl-5 py-3">
                          <div className="text-sm font-medium">{category}</div>
                        </TableCell>
                        <TableCell className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-expense" style={{ width: `${Math.min(portion, 100)}%` }} />
                            </div>
                            <span className="text-xs text-muted-foreground tnum">{portion.toFixed(1)}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 text-right pr-5 font-mono tnum font-semibold text-expense">
                          {formatIDR(amount)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Net summary */}
      <Card className={`border bg-card p-5 ${surplus ? "border-amber-400/30" : "border-red-500/30"}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              Net Cash Flow
            </p>
            <p className={`text-3xl font-bold tnum mt-1 ${surplus ? "text-gold" : "text-expense"}`}>
              {formatIDR(summary.netCashFlow, { sign: true })}
            </p>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <p>Income: <span className="text-income font-mono tnum">{formatIDR(summary.totalIncome)}</span></p>
            <p>Expense: <span className="text-expense font-mono tnum">{formatIDR(summary.totalExpense)}</span></p>
          </div>
        </div>
      </Card>
    </div>
  );
}
