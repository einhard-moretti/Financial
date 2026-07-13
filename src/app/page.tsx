"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/dashboard/header";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { TransactionTable } from "@/components/dashboard/transaction-table";
import { TransactionForm } from "@/components/dashboard/transaction-form";
import { TrashView } from "@/components/dashboard/trash-view";
import { BalanceSheet } from "@/components/dashboard/balance-sheet";
import { KeyboardShortcuts } from "@/components/dashboard/keyboard-shortcuts";
import { AccountManager } from "@/components/dashboard/account-manager";
import { InvoiceManager } from "@/components/dashboard/invoice-manager";
import { ContactManager } from "@/components/dashboard/contact-manager";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useTransactions, useSummary, useTrend } from "@/hooks/use-transactions";
import { Transaction } from "@/lib/constants";
import { ShieldCheck, Database, Clock } from "lucide-react";

type TabKey = "bulanan" | "neraca" | "invoice" | "akun" | "contact" | "trash";

export default function Home() {
  const currentMonthKey = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  })();

  const [monthKey, setMonthKey] = useState(currentMonthKey);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
  const [accountFilter, setAccountFilter] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("bulanan");

  const [formOpen, setFormOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  const { data: allTransactions, isLoading: txLoading } = useTransactions({
    monthKey,
    search: debouncedSearch || undefined,
    accountId: accountFilter || undefined,
  });

  const { data: summary, isLoading: summaryLoading } = useSummary(monthKey);
  const { data: trend, isLoading: trendLoading } = useTrend();

  const filteredTransactions = (allTransactions || []).filter((tx) => {
    if (typeFilter === "ALL") return true;
    return tx.type === typeFilter;
  });

  const incomeTransactions = filteredTransactions.filter((t) => t.type === "INCOME");
  const expenseTransactions = filteredTransactions.filter((t) => t.type === "EXPENSE");

  const totalTxCount = (allTransactions || []).length;

  const handleAddClick = useCallback(() => {
    setEditingTx(null);
    setFormOpen(true);
  }, []);

  const handleEditClick = useCallback((tx: Transaction) => {
    setEditingTx(tx);
    setFormOpen(true);
  }, []);

  const handleExportClick = useCallback(() => {
    const url = `/api/export?monthKey=${encodeURIComponent(monthKey)}`;
    window.open(url, "_blank");
  }, [monthKey]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        handleAddClick();
        return;
      }

      if (isTyping) return;

      if (e.key === "/") {
        e.preventDefault();
        const input = document.querySelector<HTMLInputElement>('input[placeholder*="Cari"]');
        input?.focus();
        return;
      }

      // Number keys 1-6 for tabs
      const tabMap: Record<string, TabKey> = {
        "1": "bulanan",
        "2": "neraca",
        "3": "invoice",
        "4": "akun",
        "5": "contact",
        "6": "trash",
      };
      if (tabMap[e.key] && !e.metaKey && !e.ctrlKey && !e.altKey) {
        setActiveTab(tabMap[e.key]);
        return;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleAddClick]);

  return (
    <div className="min-h-screen bg-background bg-grid">
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-background/50" />

      <div className="relative">
        <Header
          monthKey={monthKey}
          onMonthChange={setMonthKey}
          onAddClick={handleAddClick}
          onExportClick={handleExportClick}
          onShowShortcuts={() => setShortcutsOpen(true)}
          totalTransactions={totalTxCount}
        />

        <main className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Auto-save banner */}
          <div className="flex items-center justify-between gap-3 rounded-lg border border-amber-400/20 bg-amber-400/5 px-4 py-2.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-gold" />
              <span>
                <span className="text-gold font-medium">Auto-save enabled.</span> Every input is instantly saved to the database.
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Database className="h-3 w-3" />
                PostgreSQL
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Real-time
              </span>
            </div>
          </div>

          {/* Summary Cards — always visible */}
          <SummaryCards summary={summary} isLoading={summaryLoading} />

          {/* Trend Chart — only on Bulanan tab */}
          {activeTab === "bulanan" && (
            <TrendChart data={trend} isLoading={trendLoading} />
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabKey)}>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <TabsList className="bg-card border border-border h-9 flex-wrap">
                <TabsTrigger value="bulanan" className="data-[state=active]:bg-amber-400/10 data-[state=active]:text-gold">
                  Monthly
                </TabsTrigger>
                <TabsTrigger value="neraca" className="data-[state=active]:bg-amber-400/10 data-[state=active]:text-gold">
                  Balance Sheet
                </TabsTrigger>
                <TabsTrigger value="invoice" className="data-[state=active]:bg-amber-400/10 data-[state=active]:text-gold">
                  Invoice
                </TabsTrigger>
                <TabsTrigger value="akun" className="data-[state=active]:bg-amber-400/10 data-[state=active]:text-gold">
                  Account
                </TabsTrigger>
                <TabsTrigger value="contact" className="data-[state=active]:bg-amber-400/10 data-[state=active]:text-gold">
                  Contact
                </TabsTrigger>
                <TabsTrigger value="trash" className="data-[state=active]:bg-amber-400/10 data-[state=active]:text-gold">
                  Trash
                </TabsTrigger>
              </TabsList>

              {activeTab === "bulanan" && (
                <div className="flex-1 max-w-md ml-auto">
                  <FilterBar
                    search={search}
                    onSearchChange={setSearch}
                    typeFilter={typeFilter}
                    onTypeFilterChange={setTypeFilter}
                    accountFilter={accountFilter}
                    onAccountFilterChange={setAccountFilter}
                  />
                </div>
              )}
            </div>

            <TabsContent value="bulanan" className="mt-4 space-y-4">
              {typeFilter === "ALL" || typeFilter === "INCOME" ? (
                <TransactionTable
                  type="INCOME"
                  transactions={incomeTransactions}
                  isLoading={txLoading}
                  onEdit={handleEditClick}
                />
              ) : null}
              {typeFilter === "ALL" || typeFilter === "EXPENSE" ? (
                <TransactionTable
                  type="EXPENSE"
                  transactions={expenseTransactions}
                  isLoading={txLoading}
                  onEdit={handleEditClick}
                />
              ) : null}
            </TabsContent>

            <TabsContent value="neraca" className="mt-4">
              <BalanceSheet summary={summary} isLoading={summaryLoading} />
            </TabsContent>

            <TabsContent value="invoice" className="mt-4">
              <InvoiceManager />
            </TabsContent>

            <TabsContent value="akun" className="mt-4">
              <AccountManager />
            </TabsContent>

            <TabsContent value="contact" className="mt-4">
              <ContactManager />
            </TabsContent>

            <TabsContent value="trash" className="mt-4">
              <TrashView />
            </TabsContent>
          </Tabs>
        </main>

        <footer className="mt-auto border-t border-border/60 bg-background/50 py-6">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-[11px] text-muted-foreground">
              <span className="text-gold font-semibold">Einhard Financial</span> — Built to achieve financial freedom.
            </p>
          </div>
        </footer>
      </div>

      <TransactionForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editingTransaction={editingTx}
      />

      <KeyboardShortcuts
        open={shortcutsOpen}
        onOpenChange={setShortcutsOpen}
      />
    </div>
  );
}
