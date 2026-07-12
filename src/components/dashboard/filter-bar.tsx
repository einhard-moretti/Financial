"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAccounts } from "@/hooks/use-transactions";

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: "ALL" | "INCOME" | "EXPENSE";
  onTypeFilterChange: (value: "ALL" | "INCOME" | "EXPENSE") => void;
  accountFilter: string | null;
  onAccountFilterChange: (value: string | null) => void;
}

export function FilterBar({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  accountFilter,
  onAccountFilterChange,
}: FilterBarProps) {
  const { data: accounts } = useAccounts();

  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="Search transactions (name, category, note)..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 pr-9 bg-card border-border"
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <Select
        value={accountFilter ?? "all"}
        onValueChange={(v) => onAccountFilterChange(v === "all" ? null : v)}
      >
        <SelectTrigger className="w-full sm:w-[160px] bg-card border-border">
          <SelectValue placeholder="All accounts" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Accounts</SelectItem>
          {(accounts || []).map((acc) => (
            <SelectItem key={acc.id} value={acc.id}>
              {acc.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={typeFilter} onValueChange={(v) => onTypeFilterChange(v as "ALL" | "INCOME" | "EXPENSE")}>
        <SelectTrigger className="w-full sm:w-[130px] bg-card border-border">
          <SelectValue placeholder="All types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Types</SelectItem>
          <SelectItem value="INCOME">Income</SelectItem>
          <SelectItem value="EXPENSE">Expense</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
