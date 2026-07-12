"use client";

import { TrendingUp, TrendingDown, Wallet, Sparkles, ArrowUpRight, ArrowDownRight, Coins } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Summary, formatIDR, formatCurrency, CURRENCY_MAP } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";

interface SummaryCardsProps {
  summary: Summary | undefined;
  isLoading: boolean;
}

export function SummaryCards({ summary, isLoading }: SummaryCardsProps) {
  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl bg-card" />
        ))}
      </div>
    );
  }

  const isSurplus = summary.netCashFlow >= 0;
  const passivePct = summary.passivePercentage;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Total Income */}
      <Card className="relative overflow-hidden border-income/30 bg-card p-5 hover:border-income/50 transition-colors">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              Total Income
            </p>
            <p className="text-2xl font-bold text-income mt-2 tnum">
              {formatIDR(summary.totalIncome)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              {summary.incomeCount} income sources
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-income">
            <TrendingUp className="h-4 w-4 text-income" />
          </div>
        </div>
      </Card>

      {/* Total Expense */}
      <Card className="relative overflow-hidden border-expense/30 bg-card p-5 hover:border-expense/50 transition-colors">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              Total Expenses
            </p>
            <p className="text-2xl font-bold text-expense mt-2 tnum">
              {formatIDR(summary.totalExpense)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              {summary.expenseCount} expense items
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-expense">
            <TrendingDown className="h-4 w-4 text-expense" />
          </div>
        </div>
      </Card>

      {/* Net Cash Flow */}
      <Card
        className={`relative overflow-hidden bg-card p-5 transition-colors ${
          isSurplus ? "border-amber-400/30 hover:border-amber-400/50" : "border-red-500/30 hover:border-red-500/50"
        }`}
      >
        <div
          className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${
            isSurplus ? "via-amber-400/50" : "via-red-500/50"
          } to-transparent`}
        />
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              Net Cash Flow
            </p>
            <p
              className={`text-2xl font-bold mt-2 tnum ${
                isSurplus ? "text-gold" : "text-expense"
              }`}
            >
              {formatIDR(summary.netCashFlow, { sign: true })}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              {isSurplus ? (
                <>
                  <ArrowUpRight className="h-3 w-3 text-income" />
                  <span className="text-income">Surplus</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-3 w-3 text-expense" />
                  <span className="text-expense">Deficit</span>
                </>
              )}
            </p>
          </div>
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${
              isSurplus ? "bg-amber-400/10" : "bg-red-500/10"
            }`}
          >
            <Wallet className={`h-4 w-4 ${isSurplus ? "text-gold" : "text-expense"}`} />
          </div>
        </div>
      </Card>

      {/* Passive Income */}
      <Card className="relative overflow-hidden border-passive/30 bg-card p-5 hover:border-passive/50 transition-colors">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-500/40 to-transparent" />
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              Passive Income
            </p>
            <p className="text-2xl font-bold text-passive mt-2 tnum">
              {formatIDR(summary.totalPassive)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              {passivePct.toFixed(1)}% of total income
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-passive">
            <Sparkles className="h-4 w-4 text-passive" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-muted">
          <div
            className="h-full bg-passive transition-all duration-500"
            style={{ width: `${Math.min(passivePct, 100)}%` }}
          />
        </div>
      </Card>

      {/* Multi-currency breakdown (only show if more than IDR) */}
      {summary.byCurrency.filter((c) => c.currency !== "IDR" && (c.income > 0 || c.expense > 0)).length > 0 && (
        <Card className="border-border bg-card p-4 lg:col-span-4">
          <div className="flex items-center gap-2 mb-3">
            <Coins className="h-4 w-4 text-gold" />
            <h4 className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              Multi-Currency Breakdown (this period)
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {summary.byCurrency
              .filter((c) => c.income > 0 || c.expense > 0)
              .map((c) => {
                const cur = CURRENCY_MAP[c.currency];
                const net = c.income - c.expense;
                return (
                  <div
                    key={c.currency}
                    className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2"
                  >
                    <span className="text-sm font-medium">
                      {cur?.flag} {c.currency}
                    </span>
                    <span className="text-xs text-income font-mono tnum">
                      +{formatCurrency(c.income, c.currency, { compact: true })}
                    </span>
                    <span className="text-xs text-muted-foreground">/</span>
                    <span className="text-xs text-expense font-mono tnum">
                      −{formatCurrency(c.expense, c.currency, { compact: true })}
                    </span>
                    <span className={`text-xs font-mono tnum font-semibold ${net >= 0 ? "text-income" : "text-expense"}`}>
                      = {formatCurrency(net, c.currency, { compact: true, sign: true })}
                    </span>
                  </div>
                );
              })}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            * The summary cards above are converted to IDR. This breakdown shows the original values per currency.
          </p>
        </Card>
      )}
    </div>
  );
}
