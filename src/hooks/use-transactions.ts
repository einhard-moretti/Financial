"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Transaction,
  TransactionInput,
  Summary,
  TrendPoint,
  Account,
  Contact,
  Invoice,
  InvoiceInput,
  AccountType,
  ContactType,
} from "@/lib/constants";
import { toast } from "sonner";

// =====================================================
// Query Keys
// =====================================================
export const queryKeys = {
  transactions: (params: { monthKey?: string; type?: string; search?: string; includeDeleted?: boolean; accountId?: string }) =>
    ["transactions", params] as const,
  summary: (monthKey?: string) => ["summary", monthKey ?? "all"] as const,
  trend: () => ["trend"] as const,
  accounts: (includeArchived?: boolean) => ["accounts", includeArchived ? "all" : "active"] as const,
  contacts: (type?: ContactType) => ["contacts", type ?? "all"] as const,
  invoices: (status?: string) => ["invoices", status ?? "all"] as const,
};

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Request gagal");
  }
  return data.data as T;
}

// =====================================================
// TRANSACTIONS
// =====================================================

export function useTransactions(params: {
  monthKey?: string;
  type?: string;
  search?: string;
  includeDeleted?: boolean;
  accountId?: string;
}) {
  const qs = new URLSearchParams();
  if (params.monthKey) qs.set("monthKey", params.monthKey);
  if (params.type) qs.set("type", params.type);
  if (params.search) qs.set("search", params.search);
  if (params.includeDeleted) qs.set("includeDeleted", "true");
  if (params.accountId) qs.set("accountId", params.accountId);

  return useQuery({
    queryKey: queryKeys.transactions(params),
    queryFn: () => fetchJSON<Transaction[]>(`/api/transactions?${qs.toString()}`),
    staleTime: 0,
  });
}

export function useSummary(monthKey?: string) {
  return useQuery({
    queryKey: queryKeys.summary(monthKey),
    queryFn: () => {
      const qs = monthKey ? `?monthKey=${monthKey}` : "";
      return fetchJSON<Summary>(`/api/summary${qs}`);
    },
    staleTime: 0,
  });
}

export function useTrend() {
  return useQuery({
    queryKey: queryKeys.trend(),
    queryFn: () => fetchJSON<TrendPoint[]>(`/api/trend`),
    staleTime: 0,
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TransactionInput) =>
      fetchJSON<Transaction>("/api/transactions", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["summary"] });
      qc.invalidateQueries({ queryKey: ["trend"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      qc.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Transaction saved", {
        description: "Data is safe in the database — it won't be lost.",
      });
    },
    onError: (err: Error) => toast.error("Failed to save", { description: err.message }),
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<TransactionInput> }) =>
      fetchJSON<Transaction>(`/api/transactions/${id}`, { method: "PUT", body: JSON.stringify(input) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["summary"] });
      qc.invalidateQueries({ queryKey: ["trend"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Transaction updated");
    },
    onError: (err: Error) => toast.error("Failed to update", { description: err.message }),
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchJSON<{ message: string }>(`/api/transactions/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["summary"] });
      qc.invalidateQueries({ queryKey: ["trend"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Moved to Trash", { description: "Can be restored within 30 days." });
    },
    onError: (err: Error) => toast.error("Failed to delete", { description: err.message }),
  });
}

export function useRestoreTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchJSON<Transaction>(`/api/transactions/${id}/restore`, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["summary"] });
      qc.invalidateQueries({ queryKey: ["trend"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Transaction restored");
    },
    onError: (err: Error) => toast.error("Failed to restore", { description: err.message }),
  });
}

export function usePermanentDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchJSON<{ message: string }>(`/api/transactions/${id}/permanent`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["summary"] });
      qc.invalidateQueries({ queryKey: ["trend"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Permanently deleted");
    },
    onError: (err: Error) => toast.error("Failed to delete permanently", { description: err.message }),
  });
}

// =====================================================
// ACCOUNTS
// =====================================================

export function useAccounts(includeArchived: boolean = false) {
  return useQuery({
    queryKey: queryKeys.accounts(includeArchived),
    queryFn: () => fetchJSON<Account[]>(`/api/accounts?includeArchived=${includeArchived}`),
    staleTime: 0,
  });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; currency: string; type: AccountType; initialBalance: number; notes?: string | null }) =>
      fetchJSON<Account>("/api/accounts", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accounts"] });
      qc.invalidateQueries({ queryKey: ["summary"] });
      toast.success("Account created");
    },
    onError: (err: Error) => toast.error("Failed to create account", { description: err.message }),
  });
}

export function useUpdateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<{ name: string; currency: string; type: AccountType; initialBalance: number; notes?: string | null }> }) =>
      fetchJSON<Account>(`/api/accounts/${id}`, { method: "PUT", body: JSON.stringify(input) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accounts"] });
      qc.invalidateQueries({ queryKey: ["summary"] });
      toast.success("Account updated");
    },
    onError: (err: Error) => toast.error("Failed to update account", { description: err.message }),
  });
}

export function useArchiveAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchJSON<{ message: string }>(`/api/accounts/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accounts"] });
      qc.invalidateQueries({ queryKey: ["summary"] });
      toast.success("Account archived");
    },
    onError: (err: Error) => toast.error("Failed to archive", { description: err.message }),
  });
}

// =====================================================
// CONTACTS
// =====================================================

export function useContacts(type?: ContactType) {
  const qs = type ? `?type=${type}` : "";
  return useQuery({
    queryKey: queryKeys.contacts(type),
    queryFn: () => fetchJSON<Contact[]>(`/api/contacts${qs}`),
    staleTime: 0,
  });
}

export function useCreateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; type: ContactType; email?: string | null; phone?: string | null; country?: string | null; notes?: string | null }) =>
      fetchJSON<Contact>("/api/contacts", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Contact added");
    },
    onError: (err: Error) => toast.error("Failed to add contact", { description: err.message }),
  });
}

export function useUpdateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<{ name: string; type: ContactType; email?: string | null; phone?: string | null; country?: string | null; notes?: string | null }> }) =>
      fetchJSON<Contact>(`/api/contacts/${id}`, { method: "PUT", body: JSON.stringify(input) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Contact updated");
    },
    onError: (err: Error) => toast.error("Failed to update contact", { description: err.message }),
  });
}

export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchJSON<{ message: string }>(`/api/contacts/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Contact deleted");
    },
    onError: (err: Error) => toast.error("Failed to delete contact", { description: err.message }),
  });
}

// =====================================================
// INVOICES
// =====================================================

export function useInvoices(status?: string) {
  const qs = status ? `?status=${status}` : "";
  return useQuery({
    queryKey: queryKeys.invoices(status),
    queryFn: () => fetchJSON<(Invoice & { daysUntilDue: number })[]>(`/api/invoices${qs}`),
    staleTime: 0,
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: InvoiceInput) =>
      fetchJSON<Invoice>("/api/invoices", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice created", { description: "Auto-number generated" });
    },
    onError: (err: Error) => toast.error("Failed to create invoice", { description: err.message }),
  });
}

export type InvoiceUpdateInput = Partial<InvoiceInput> & { status?: string };

export function useUpdateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; input: InvoiceUpdateInput }) =>
      fetchJSON<Invoice>(`/api/invoices/${params.id}`, { method: "PUT", body: JSON.stringify(params.input) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice updated");
    },
    onError: (err: Error) => toast.error("Failed to update invoice", { description: err.message }),
  });
}

export function useDeleteInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchJSON<{ message: string }>(`/api/invoices/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice deleted");
    },
    onError: (err: Error) => toast.error("Failed to delete invoice", { description: err.message }),
  });
}

export function useSendInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchJSON<Invoice>(`/api/invoices/${id}/send`, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice marked as sent");
    },
    onError: (err: Error) => toast.error("Failed to update status", { description: err.message }),
  });
}

export function useMarkInvoicePaid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body?: { receivedAmount?: number; receivedExchangeRate?: number; paidDate?: string } }) =>
      fetchJSON<{ invoice: Invoice; transaction: Transaction }>(`/api/invoices/${id}/mark-paid`, { method: "POST", body: JSON.stringify(body || {}) }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["summary"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Invoice paid", { description: "Income transaction auto-created" });
      return data;
    },
    onError: (err: Error) => toast.error("Failed to mark as paid", { description: err.message }),
  });
}
